import { Command, AccessLevel, CommandError } from "./command";
import { Message } from "discord.js";

/** This command is used to delete a specific amount of messages from a channel */
export class Purge extends Command {
    constructor() {
        super("purge", "p", "Deletes the specified amount of messages\n`purge {Amount of Messages}`", AccessLevel.Moderator);
    }

    async run(message: Message, content: string[]): Promise<void> {
        content.shift();

        let purgeAmount: number = Number.parseInt(content[0]) + 1; // Counting the message with the command itself
        if (isNaN(purgeAmount))
            throw new CommandError("The purge amount is not a valid number");
        if (purgeAmount <= 0)
            throw new CommandError("The purge amount must be greater than 0");

        while (purgeAmount) {
            let amount = Math.min(purgeAmount, 100);
            message.channel.bulkDelete(amount, true);
            purgeAmount -= amount;
        }
    }
}
