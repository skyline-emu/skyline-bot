import { DiscordEvent } from "./event";
import { filterArray } from "../main.js";
import { Filter } from "../filters/filter";
import { Message } from "discord.js";

/** This event is used for redirecting all messages to filters */
export class MessageEvent extends DiscordEvent {
    constructor() {
        super("message");
    }

    async run(client: any, msg: Message): Promise<void> {
        for (let index = 0; index < filterArray.length; index++) {
            let filter: Filter = filterArray[index];
            let result: boolean = await filter.run(msg);

            if (result == false) return;
        }
    }
}
