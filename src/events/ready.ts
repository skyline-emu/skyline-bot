import { ActivityType, Client, Events } from "discord.js";

export const event = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        console.log(`Logged in as ${client.user!.username}#${client.user!.discriminator}`);

        client.user!.setPresence({
            activities: [{ type: ActivityType.Watching, name: "/help" }],
            status: "online"
        });
    }
};
