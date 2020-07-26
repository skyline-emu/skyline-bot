import { Filter } from "./filter";
import { Message } from "discord.js";
import { serializeMessage } from "../common/serializeMessage";

/** This filter is purely a passthrough filter that logs any message recieved by the bot */
export class Log extends Filter {
    constructor() {
        super(10);
    }

    async run(message: Message): Promise<boolean> {
        console.log(`${message.author.username}#${message.author.discriminator}: ${serializeMessage(message)}`);
        return true;
    }
}
