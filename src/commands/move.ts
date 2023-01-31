//@ts-ignore
import config from "../config.json" assert { type : "json" };
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, Message, SlashCommandBuilder, TextChannel } from "discord.js";
import { AccessLevel, serializeMessage } from "../common/commonFunctions.js";
import { IncomingMessage } from "http";
import https from "https";

export const command = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Moves the specified amount of messages to another channel using Webhooks")
        .addSubcommand(subcommand =>
            subcommand
                .setName("default")
                .setDescription("Moves the specified amount of messages")
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
                        .setDescription("The amount of messages to move")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("ids")
                .setDescription("Moves one or more messages using IDs")
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
                        .setName("first-message-id")
                        .setDescription("First message ID")
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName("last-message-id")
                        .setDescription("Last message ID")
                        .setRequired(true))),
    level: AccessLevel.Helper,
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        let messages = new Array<Message>();
        let channel = interaction.options.getChannel("channel");

        if (interaction.options.getSubcommand() == "default") {
            let messageAmount = interaction.options.getInteger("amount");
            if (messageAmount! <= 0)
                return interaction.editReply({ content: "Invalid amount of messages specified" });

            while (messageAmount) {
                let amount = Math.min(messageAmount, 100);
                Array.prototype.push.apply(messages, [...(await interaction.channel!.messages.fetch({ limit: amount })).values()]);
                messageAmount -= amount;
            }
            messages.reverse();
            if (!messages.length)
                return interaction.editReply({ content: "Channel needs at least one message to move" });
        } else {
            let firstmID : any = interaction.options.getString("first-message-id"), lastmID : any = interaction.options.getString("last-message-id");

            if (!/^\d{15,20}$/.test(lastmID) || !/^\d{15,20}$/.test(firstmID)) //Checks for non-digits and extra digits
                return interaction.editReply({ content: "One or both ID submissions are not Snowflakes" });
            try {
                await interaction.channel!.messages.fetch(lastmID);
                await interaction.channel!.messages.fetch(firstmID);
            } catch (err) {
                console.error(err);
                return interaction.editReply({ content: "Unknown Message" });
            }
			
            let lastMessage = await interaction.channel!.messages.fetch(lastmID), firstMessage = await interaction.channel!.messages.fetch(firstmID);

            if (firstMessage.createdTimestamp > lastMessage.createdTimestamp)
                return interaction.editReply({ content: "Last message was sent before the first message" });
            if (firstMessage.channel.id != lastMessage.channel.id)
                return interaction.editReply({ content: "Messages weren't sent in the same channel" });

            if (firstMessage === lastMessage) {
                messages.push(firstMessage);
            } else {
                while (true) {
                    let subset = await interaction.channel!.messages.fetch({ limit: 100, after: messages[messages.length - 1].id });
                    if (subset.has(lastMessage.id)) {
                        let flag = false;
                        subset.forEach((value, key) => {
                            if (key == lastMessage.id)
                                flag = true;
                            if (flag)
                                messages.push(value);
                        });
                        break;
                    } else {
                        Array.prototype.push.apply(messages, [...subset.values()].reverse());
                    }
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
		
        let response = await interaction.editReply({ embeds: [new EmbedBuilder({title: `Moving ${messages.length} messages to ${channel!.name}, confirm?`, fields: [{ name: "Oldest message:", value: serializeMessage(messages[0]) }] })], components: [button]});
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

                    let left = messages.length;
        			while (left) {
            			let index = messages.length - left, amount = Math.min(left, 100);
            			(interaction.channel! as TextChannel).bulkDelete(messages.slice(index, index + amount), true);
            			left -= amount;
        			}
                    recievedButton.update({ embeds: [new EmbedBuilder({ title: `${messages.length} messages moved.` }).setColor("Green")], components: [button]});
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
                    recievedButton.update({ embeds: [new EmbedBuilder({ title: "Move canceled." }).setColor("Red")], components: [button]});
                }
            }, async () => {
                interaction.editReply({embeds: [new EmbedBuilder({ title: `No confirmation within ${config.deleteTime/1000} seconds.` }).setColor("Red")], components: []});
            })
            .catch(console.error);		
    }
};
