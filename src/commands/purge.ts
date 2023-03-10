import { ChatInputCommandInteraction, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Deletes the specified amount of messages (max 100)")
        .addIntegerOption(option =>
            option
                .setName("message-count")
                .setDescription("Amount of messages to delete (max 100)")
                .setRequired(true)),
    level: AccessLevel.Helper,
    async execute(interaction: ChatInputCommandInteraction) {
        let purgeAmount = interaction.options.getInteger("message-count")!;
        if (purgeAmount <= 0 || purgeAmount > 100) {
            return await interaction.reply({ content: "The purge amount must be greater than 0 and no more than 100", ephemeral: true});
        } else {
            (interaction.channel! as GuildTextBasedChannel).bulkDelete(purgeAmount, true);
            interaction.reply({ content: `${purgeAmount} messages purged`, ephemeral: true});
        }
    }
};
