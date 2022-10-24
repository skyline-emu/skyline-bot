import { Command, AccessLevel } from "./command";
import { Message } from "discord.js";
import fs from "fs";
export class RandomShowcase extends Command {
    constructor() {
        super("randomshowcase", "rs", "Random message from showcase attachment database.", AccessLevel.User);
    }
    async run(message: Message, args: Array<string>): Promise<void> {
        //Read the showcase.txt contents, split it into an array, and get a random element from the array
        const showcasecontext = fs.readFileSync("showcase.txt", "utf8");
        const array = showcasecontext.split("\n");
        const randomElement = array[Math.floor(Math.random() * array.length)];
        //Send the random element to the channel
        await message.channel.send(randomElement);
}
}