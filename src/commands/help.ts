//@ts-ignore
import config from "../config.json" assert { type: "json" };
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { AccessLevel, userHasAccess } from "../common/commonFunctions.js";
import fs from "node:fs";

export const command = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Recieve this help embed in DMs"),
    level: AccessLevel.User,
    async execute(interaction: ChatInputCommandInteraction) {
        let embed = new EmbedBuilder({ title: "**Skyline Bot Commands**" }).setColor("Green");

        const commandFiles = fs.readdirSync("./build/commands").filter(file => file.endsWith(".js"));

        for (const file of commandFiles){
            const { command } = await import(`./${file}`);
            if (userHasAccess(interaction.user, interaction.guild!, command.level)){
                embed.addFields({ name: command.data.name, value: command.data.description, inline: false});
            }
        }
        if (config.dmResponses) {
            await interaction.reply({ content: "Check DMs", ephemeral: true });
            interaction.user.send({ embeds: [embed] });
            await interaction.deleteReply();
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};
