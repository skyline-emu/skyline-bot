import { Command, AccessLevel } from "./command";
import { Message } from "discord.js";
import fs from "fs";
export class RandomShowcase extends Command {
    constructor() {
        super("randomshowcase", "rs", "Random message from showcase attachment database.", AccessLevel.User);
    }
    async run(message: Message, args: Array<string>): Promise<void> {
        //Read the showcase.json file and choose a message. (each message is in between {}) Then:
        //1. Get all the {} brackets
        //2. Choose a random one
        //3. Send a message without the brackets. Here is an example:{"message":"https://www.youtube.com/watch?v=CMtF7nxMv5A","author":"Silverdragon_12"}
        //4. In that example, the message would be: https://www.youtube.com/watch?v=CMtF7nxMv5A Showcase Message By: Silverdragon_12
        let showcase = fs.readFileSync("showcase.json", "utf8");
        let showcasearray = showcase.split("},");
        let randomshowcase = showcasearray[Math.floor(Math.random() * showcasearray.length)];
        randomshowcase = randomshowcase.replace("{", "");
        randomshowcase = randomshowcase.replace("}", "");
        let randomshowcasearray = randomshowcase.split(",");
        let randomshowcasemessage = randomshowcasearray[0];
        let randomshowcaseauthor = randomshowcasearray[1];
        randomshowcasemessage = randomshowcasemessage.replace('"message":"', "");
        randomshowcasemessage = randomshowcasemessage.replace('"', "");
        randomshowcaseauthor = randomshowcaseauthor.replace('"author":"', "");
        randomshowcaseauthor = randomshowcaseauthor.replace('"', "");
        message.channel.send(randomshowcasemessage + " Showcase Message By: " + randomshowcaseauthor);
    }
}