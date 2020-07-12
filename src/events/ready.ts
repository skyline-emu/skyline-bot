import { DiscordEvent } from "./event";
import config from "../config.json";

/** This event is used to do some setup after the bot has established a connection with the Discord API */
export class Ready extends DiscordEvent {
    constructor() {
        super("ready");
    }

    async run(client: any): Promise<void> {
        console.log(`Logged in as ${client.user.username}#${client.user.discriminator}!`);

        client.user.setPresence({
            game: { type: "WATCHING", name: `you! | ${config.prefix}help` },
            status: "online"
        });
    }
}
