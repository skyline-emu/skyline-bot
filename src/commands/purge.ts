import { Command, AccessLevel, CommandError } from "./command";
import { Message } from "discord.js";

/** This command is used to delete a specific amount of messages from a channel */
export class Purge extends Command {
    constructor() {
        super("purge", "p", AccessLevel.Moderator, "Deletes the specified amount of messages\n`purge {Amount of Messages}`", true);
    }

    async run(message: Message, content: string[]): Promise<void> {
        content.shift();

        let purgeAmt: number = Number.parseInt(content[0]) + 1; // Counting the message with the command itself
        if (isNaN(purgeAmt))
            throw new CommandError("The purge amount is not a valid number");
        if (purgeAmt <= 0)
            throw new CommandError("The purge amount must be greater than 0");

        let iterations: number = purgeAmt / 100;
        if (iterations <= 1) {
            message.channel.bulkDelete(purgeAmt, true);
        } else {
            for (let i: number = 0; i != iterations; i++)
                message.channel.bulkDelete(100, true);
            message.channel.bulkDelete(purgeAmt - 100 * iterations, true);
        }
    }
}
