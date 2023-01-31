//@ts-ignore
import config from "../config.json" assert { type: "json" };
import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder, ChannelType, Message } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName("edit")
        .setDescription("Edits a message sent by the bot")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel of message to edit")
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
                .setName("message")
                .setDescription("ID of message to edit")
                .setRequired(true)),
    level: AccessLevel.Admin,
    async execute(interaction: ChatInputCommandInteraction) {
        let channel : any = interaction.options.getChannel("channel");
        let messageId = interaction.options.getString("message");
        let message : Message;

        if (!/^\d{15,20}$/.test(messageId!))
            return interaction.reply({ content: "Submission is not a snowflake", ephemeral: true });
        
        try {
            message = await channel.messages.fetch(messageId);
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "Unknown Message", ephemeral: true });
        }
        
        if (message.author.id != interaction.client.user.id)
            return interaction.reply({ content: "Cannot edit another user's message", ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId("editor")
            .setTitle("Message Editor");

        const oldText = new TextInputBuilder()
            .setCustomId("oldText")
            .setLabel("Original text:")
            .setMaxLength(2000)
            .setValue(message!.content)
            .setStyle(TextInputStyle.Paragraph);

        const newTextInput = new TextInputBuilder()
            .setCustomId("newText")
            .setLabel("Replacement text:")
            .setMaxLength(2000)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(oldText), new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(newTextInput));
        interaction.showModal(modal);

        interaction.awaitModalSubmit({ time: 300000 })
            .then(modals => {
                message.edit(modals.fields.getTextInputValue("newText"));
                modals.reply({ content: `[Message](https://discord.com/channels/${config.guildId}/${channel.id}/${messageId}) edited.`, ephemeral: true });
            }, async () => {
                interaction.followUp({ content: "Took longer than 5 minutes to recieve a response, please try again", ephemeral: true });
            })
            .catch(console.error);
    }
};
