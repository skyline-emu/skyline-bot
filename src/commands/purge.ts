import { ChatInputCommandInteraction, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Deletes the specified amount of messages")
        .addIntegerOption(option =>
            option
                .setName("message-count")
                .setDescription("Amount of messages to delete")
                .setRequired(true)),
    level: AccessLevel.Helper,
    async execute(interaction: ChatInputCommandInteraction) {
        let purgeAmount = interaction.options.getInteger("message-count")!;
        let originalPurgeAmount = purgeAmount;
        if (purgeAmount <= 0) {
            return await interaction.reply({ content: "The purge amount must be greater than 0", ephemeral: true});
        } else {
            while (purgeAmount) {
                let amount = Math.min(purgeAmount, 100);
                (interaction.channel! as GuildTextBasedChannel).bulkDelete(amount, true);
                purgeAmount -= amount;
            }
            interaction.reply({ content: `${originalPurgeAmount} messages purged`, ephemeral: true});
        }
    }
};
