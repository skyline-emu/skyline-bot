//@ts-ignore
import config from "../config.json" assert { type : "json" };
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, Message, SlashCommandBuilder, TextChannel } from "discord.js";
import { AccessLevel, isSnowflake, serializeMessage } from "../common/commonFunctions.js";
import { IncomingMessage } from "http";
import https from "https";

export const command = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Moves the specified amount of messages to another channel using Webhooks (max 100)")
        .addSubcommand(subcommand =>
            subcommand
                .setName("default")
                .setDescription("Moves the specified amount of messages (max 100)")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel to move messages to")
                        .setRequired(true)
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.PublicThread, 
                            ChannelType.PrivateThread, 
                            ChannelType.GuildVoice,
                            ChannelType.GuildAnnouncement,
                            ChannelType.AnnouncementThread,
                            ChannelType.GuildStageVoice))
                .addIntegerOption(option =>
                    option
                        .setName("amount")
                        .setDescription("The amount of messages to move (max 100)")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("ids")
                .setDescription("Moves one or more messages using IDs (max 100)")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel to move messages to")
                        .setRequired(true)
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.PublicThread, 
                            ChannelType.PrivateThread, 
                            ChannelType.GuildVoice,
                            ChannelType.GuildAnnouncement,
                            ChannelType.AnnouncementThread,
                            ChannelType.GuildStageVoice))
                .addStringOption(option =>
                    option
                        .setName("earliest-msg-id")
                        .setDescription("First message ID")
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName("latest-msg-id")
                        .setDescription("Last message ID")
                        .setRequired(true))),
    level: AccessLevel.Helper,
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        let messages = new Array<Message>();
        let channel = interaction.options.getChannel("channel");

        if (interaction.options.getSubcommand() == "default") {
            let messageAmount = interaction.options.getInteger("amount")!;
            if (messageAmount <= 0 || messageAmount > 100)
                return interaction.editReply({ content: "The purge amount must be greater than 0 and no more than 100" });
            Array.prototype.push.apply(messages, [...(await interaction.channel!.messages.fetch({ limit: messageAmount })).values()].reverse());
            if (messages.length == 0) {
                return interaction.editReply({ content: "No messages to purge" });
            }
        } else {
            let firstmID = interaction.options.getString("earliest-msg-id")!, lastmID = interaction.options.getString("latest-msg-id")!;
            if (!isSnowflake(lastmID) || !isSnowflake(firstmID))
                return interaction.editReply({ content: "One or both ID submissions are not Snowflakes" });
            try {
                await interaction.channel!.messages.fetch(firstmID);
                await interaction.channel!.messages.fetch(lastmID);
            } catch (err) {
                console.error(err);
                return interaction.editReply({ content: "Unknown message" });
            }

            let firstMessage = await interaction.channel!.messages.fetch(firstmID), lastMessage = await interaction.channel!.messages.fetch(lastmID);
            if (firstMessage.createdTimestamp > lastMessage.createdTimestamp)
                return interaction.editReply({ content: "Last message was sent before the first message" });
            if (firstMessage === lastMessage) {
                messages.push(firstMessage);
            } else {
                let subset = await interaction.channel!.messages.fetch({ limit: 99, after: firstmID });
                let tempMessages = new Array<Message>();
                tempMessages.push(firstMessage);
                Array.prototype.push.apply(tempMessages, [...subset.values()].reverse());
                while (true) {
                    let testMessage = tempMessages.find(message => message.createdTimestamp <= lastMessage.createdTimestamp);
                    if (testMessage) {
                        messages.push(testMessage);
                        tempMessages.splice(tempMessages.indexOf(testMessage), 1);
                    } else {
                        break;
                    };
                }
            }
        }

        const button = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("yes")
                    .setLabel("Yes")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("no")
                    .setLabel("No")
                    .setStyle(ButtonStyle.Secondary));
		
        let response = await interaction.editReply({ embeds: [new EmbedBuilder({title: `Moving ${messages.length} messages to ${channel!.name}, confirm`, fields: [{ name: "Earliest message:", value: serializeMessage(messages[0]) }, {name: "Latest message:", value: serializeMessage(messages[messages.length - 1])}] })], components: [button]});
        let webhook = (await (channel as TextChannel).fetchWebhooks()).find((value) => value.name == "SkylineMove") ?? await (channel as TextChannel).createWebhook({ name: "SkylineMove"});
		
        response.awaitMessageComponent({ time: config.deleteTime, componentType: ComponentType.Button })
            .then(async recievedButton => {
                if (recievedButton.customId == "yes") {
                    button.setComponents(
                        new ButtonBuilder()
                            .setCustomId("yes")
                            .setLabel("Yes")
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId("no")
                            .setLabel("No")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true));
                    recievedButton.update({ embeds: [new EmbedBuilder({ title: `Moving ${messages.length} messages...` }).setColor("Green")], components: [button]});
                    for (const message of messages) {
                        let MessageAttachments = Array<AttachmentBuilder>();

                        for (let messageMessageAttachment of message.attachments.values()) {
                            let content: IncomingMessage = await new Promise(async (resolve, reject) => {
                                https.get(messageMessageAttachment.url).on("response", (response: IncomingMessage) => {
                                    response ? resolve(response) : reject();
                                });
                            });
			
                            MessageAttachments.push(new AttachmentBuilder(content, { name: messageMessageAttachment.name ?? undefined}));
                        }
                        if (message.content.length > 0) {
                            await webhook.send({
                                content: message.content,
                                username: message.author.username,
                                avatarURL: message.author.avatarURL() ?? undefined,
                                files: MessageAttachments,
                                embeds: message.embeds,
                                allowedMentions: {parse: []},
                            });
                        } else {
                            await webhook.send({
                                username: message.author.username,
                                avatarURL: message.author.avatarURL() ?? undefined,
                                files: MessageAttachments,
                                embeds: message.embeds,
                                allowedMentions: {parse: []},
                            });
                        }
                    }

                    await (interaction.channel! as TextChannel).bulkDelete(messages, true);
                    recievedButton.editReply({ embeds: [new EmbedBuilder({ title: `${messages.length} messages moved` }).setColor("Green")], components: [button]});
                } else {
                    button.setComponents(
                        new ButtonBuilder()
                            .setCustomId("yes")
                            .setLabel("Yes")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId("no")
                            .setLabel("No")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true));
                    recievedButton.update({ embeds: [new EmbedBuilder({ title: "Move canceled" }).setColor("Red")], components: [button]});
                }
            }, async () => {
                interaction.editReply({embeds: [new EmbedBuilder({ title: `No confirmation within ${config.deleteTime/1000} seconds` }).setColor("Red")], components: []});
            })
            .catch(console.error);		
    }
};
