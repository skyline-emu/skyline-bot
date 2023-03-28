//@ts-ignore
import config from "../config.json" assert { type: "json" };
import { Events, GuildTextBasedChannel, Interaction } from "discord.js";
import { isNormalUser } from "../common/commonFunctions.js";

export const event = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        console.log(`${interaction.user.tag} triggered an interaction in #${(interaction.channel as GuildTextBasedChannel)!.name}`);

        if (!interaction.isChatInputCommand()) return;

        //Attachment-only channel filter (for commands)
        if (config.attachmentOnlyChannels.includes(interaction.channel!.id) && isNormalUser(interaction.user, interaction.guild!)) {
            return interaction.reply({ content: "Commands cannot be used in this channel", ephemeral: true });
        }

        //If it's a command, execute it
        const command = interaction.client.commands.get(interaction.commandName);
    
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    }
};
