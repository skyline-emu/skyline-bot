import { Command, AccessLevel, CommandError } from "./command"
import { Message } from "discord.js";

export class Purge extends Command {
    constructor() {
        super("purge", "", AccessLevel.Moderator, "Purges a set number of messages.", true);
    }

    async run(message: Message, content: string[]): Promise<void> {
        content.shift();

        let purgeAmt: number = Number.parseInt(content[0]);
        if (isNaN(purgeAmt))
            return;

        let iterations: number = purgeAmt / 100;

        if (purgeAmt <= 0)
            throw new CommandError("The purge ammount must be greater than 0");

        if (iterations <= 1)
            message.channel.bulkDelete(purgeAmt, true);
        else {
            for (let i: number = 0; i != iterations; i++) {
                message.channel.bulkDelete(100, true);
            }
            message.channel.bulkDelete(purgeAmt - (100 * iterations), true);
        }
    }
}