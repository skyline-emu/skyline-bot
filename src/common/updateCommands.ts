//@ts-ignore
import config from "../config.json" assert { type: "json" };
import { REST, Routes } from "discord.js";
import { AccessLevel } from "./commonFunctions.js";
import fs from "node:fs";

// Get the command files from the commands directory
const commands = [];
const commandFiles = fs.readdirSync("./build/commands").filter(file => file.endsWith(".js"));

// Get the output of each command's data for updating
for (const file of commandFiles) {
    const { command } = await import(`../commands/${file}`);
    switch (command.level) {
        case AccessLevel.Admin:
            command.data.setDefaultMemberPermissions(8); //Administrator
            break;
        case AccessLevel.Moderator:
            command.data.setDefaultMemberPermissions(8322); //View Audit Log, Kick Members, Manage Messages
            break;
        case AccessLevel.Helper:
            command.data.setDefaultMemberPermissions(8194); // Kick Members, Manage Messages
            break;
        case AccessLevel.User:
            break;
        case undefined:
            throw console.error(`\nNo AccessLevel provided for "${command.data.name}" command! Add "level" property to command file`);
        default:
            let options = Object.keys(AccessLevel).filter((v) => isNaN(Number(v)));
            options.forEach((value, index) => options.splice(index, 1, `AccessLevel.${value}`));
            throw console.error(`\nAccessLevel provided for "${command.data.name}" command is invalid! Valid options are ${options.join(", ")}`);
    }
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(config.token);

// Fully update all commands
(async () => {
    try {
        console.log(`Started updating ${commands.length} slash commands.`);

        const data : any = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }, // To delete registered commands: { body : [] }
        );

        console.log(`Successfully updated ${data.length} slash commands.`);
    } catch (error) {
        console.error(error);
    }
})();
