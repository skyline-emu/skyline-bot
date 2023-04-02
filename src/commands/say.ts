import { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, TextChannel } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Sends a message from the bot")
        .addSubcommand(subcommand =>
            subcommand
                .setName("direct-message")
                .setDescription("Sends a message from the bot to a user in DMs")
                .addStringOption(option =>
                    option
                        .setName("message")
                        .setDescription("The message to send")
                        .setRequired(true))
                .addUserOption(option =>
                    option
                        .setName("target-user")
                        .setDescription("The user to DM")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("guild-channel")
                .setDescription("Sends a message from the bot in a specified channel")
                .addStringOption(option =>
                    option
                        .setName("message")
                        .setDescription("The message to send")
                        .setRequired(true))
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
                .setDescription("Sends a message from the bot in the current channel")
                .addStringOption(option =>
                    option
                        .setName("message")
                        .setDescription("The message to send")
                        .setRequired(true))),
    level: AccessLevel.Admin,
    execute(interaction: ChatInputCommandInteraction) {
        const message = interaction.options.getString("message");
        if (message!.length > 2000)
            return interaction.reply({ content: "Message length must be 2000 characters or less", ephemeral: true });

        switch(interaction.options.getSubcommand()){
            case "direct-message":
                const user = interaction.options.getUser("target-user");
                user?.send(message!);
                interaction.reply({ content: `Message sent to ${user?.username}`, ephemeral: true });
                break;
            case "guild-channel":
                const channel = interaction.options.getChannel("target-channel");
                (channel as TextChannel).send(message!);
                interaction.reply({ content: `Message sent to ${channel}`, ephemeral: true });
                break;
            case "default":
                interaction.channel?.send(message!);
                interaction.reply({ content: "Message sent to current channel", ephemeral: true });
        }
    }
};
