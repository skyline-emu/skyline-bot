import { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, TextChannel, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalActionRowComponentBuilder } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName("say-multi")
        .setDescription("Sends a message from the bot using modals")
        .addSubcommand(subcommand =>
            subcommand
                .setName("direct-message")
                .setDescription("Sends a message from the bot to a user in DMs using modals")
                .addUserOption(option =>
                    option
                        .setName("target-user")
                        .setDescription("The user to DM")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("guild-channel")
                .setDescription("Sends a message from the bot in a specified channel using modals")
                .addChannelOption(option => 
                    option
                        .setName("target-channel")
                        .setDescription("The channel to send the message in")
                        .setRequired(true)
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.PublicThread, 
                            ChannelType.PrivateThread, 
                            ChannelType.GuildVoice,
                            ChannelType.GuildAnnouncement,
                            ChannelType.AnnouncementThread,
                            ChannelType.GuildStageVoice)))		
        .addSubcommand(subcommand =>
            subcommand
                .setName("default")
                .setDescription("Sends a message from the bot in the current channel using modals")),
    level: AccessLevel.Admin,
    execute(interaction: ChatInputCommandInteraction) {
        const modal = new ModalBuilder()
            .setCustomId("messenger")
            .setTitle("Message Creator");

        const TextInput = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Text to send:")
            .setMaxLength(2000)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(TextInput));
        interaction.showModal(modal);

        interaction.awaitModalSubmit({ time: 300000 })
            .then(modals => {
                let message = modals.fields.getTextInputValue("text");
                switch(interaction.options.getSubcommand()){
                    case "direct-message":
                        const user = interaction.options.getUser("target-user");
                        user?.send(message);
                        modals.reply({ content: `Message sent to ${user?.username}`, ephemeral: true });
                        break;
                    case "guild-channel":
                        const channel = interaction.options.getChannel("target-channel");
                        (channel as TextChannel).send(message);
                        modals.reply({ content: `Message sent to ${channel}`, ephemeral: true });
                        break;
                    case "default":
                        interaction.channel?.send(message);
                        modals.reply({ content: "Message sent to current channel", ephemeral: true });
                }
            }, async () => {
                interaction.followUp({ content: "Took longer than 5 minutes to recieve a response, please try again", ephemeral: true });
            })
            .catch(console.error);
    }
};
