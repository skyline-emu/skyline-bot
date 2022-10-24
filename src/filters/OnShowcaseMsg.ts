import { Filter } from "./filter";
import { Message } from "discord.js";
import fs from "fs";
export class OnShowcaseMsg extends Filter {
    constructor() {
        super(9);
    }
    //Do the following upon a new message in the discord server
    //1. Check if the message is in the showcase channel (1033815355866497064)
    //2. If it is, check if the message is a link
    //3. If it is a link, add it to the showcase.json file
    async run(message: Message<boolean>): Promise<boolean> {
        if (message.channel.id == "986020197146169354") {
            if (message.content.startsWith("https://")) {
                //Read the showcase.txt contents
                const showcasecontext = fs.readFileSync("showcase.txt", "utf8");
                const array = showcasecontext.split("\n");
                array.push(message.content);
                let newFileContent = array.join("\n");
                fs.writeFileSync("showcase.txt", newFileContent);
                console.log("Showcase attachment added!");
            }
        }
        return true;
    }

}