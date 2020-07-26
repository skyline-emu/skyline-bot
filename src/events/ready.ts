import { DiscordEvent } from "./event";
import config from "../config.json";
import { Client } from "discord.js";

/** This event is used to do some setup after the bot has established a connection with the Discord API */
export class Ready extends DiscordEvent {
    constructor() {
        super("ready");
    }

    async run(client: Client): Promise<void> {
        let user = client.user!!;
        console.log(`Logged in as ${user.username}#${user.discriminator}!`);

        await user.setPresence({
            activity: { type: "WATCHING", name: `you! | ${config.prefix}help` },
            status: "online"
        });
    }
}
