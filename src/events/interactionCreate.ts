import { Events, GuildTextBasedChannel, Interaction } from "discord.js";

export const event = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        console.log(`${interaction.user.tag} triggered an interaction in #${(interaction.channel as GuildTextBasedChannel)!.name}.`);

        if (!interaction.isChatInputCommand()) return;

        //If it's a command, execute it
        const command = interaction.client.commands.get(interaction.commandName);
    
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
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
