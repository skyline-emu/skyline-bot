import { Client } from "discord.js";

/** The abstract DiscordEvent class is used to provide a common API for all events recieved from the Discord API */
export abstract class DiscordEvent {
    /** The type of event that this class should be ran on occuring */
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    /** This function is called when any event of `type` is recieved from the Discord API */
    abstract run(client: Client, ...args: any): Promise<void>;
}
