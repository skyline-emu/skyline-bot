import { Command, AccessLevel, CommandError } from "./command";
import config  from "../config.json";
import { Message, MessageEmbed, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import fs from "fs";
export class SearchShowcase extends Command {
    constructor() {
        super("searchshowcase", "ss", "Searches the showcase attachment database for a message.", AccessLevel.User);
    }
    async run(message: Message, content: string[]): Promise<void> {
        
        if (content.length == 0)
            throw new CommandError("You must provide the name of the game to search for");

        let gameName = content.join(" ");
        let showcasejson = fs.readFileSync("./showcase.json", "utf8");
        let showcasejsonarray = showcasejson.split("},");
        let showcasearray = [];
        showcasejsonarray =  showcasejsonarray.reverse();
        for (let i = 0; i < showcasejsonarray.length; i++) {
            if (showcasejsonarray[i].includes(gameName)) {
                showcasearray.push(showcasejsonarray[i]);
            }
        }
        if (showcasearray.length == 0) {
            message.channel.send("No entries found for " + gameName);
            return;
        }
        
        message.author.send("Here are the most recent entries for " + gameName + ":");
        let firstentry = showcasearray[0];
        firstentry = firstentry.replace("{", "");
        firstentry = firstentry.replace("}", "");
        firstentry = firstentry.replace("]", "");
        firstentry = firstentry.replace("[", "");
        let firstentryarray = firstentry.split(",");
        let firstentrymessage = firstentryarray[0];
        let firstentryauthor = firstentryarray[1];
        firstentrymessage = firstentrymessage.replace('"message":"', "");
        firstentrymessage = firstentrymessage.replace('"', "");
        firstentryauthor = firstentryauthor.replace('"author":"', "");
        firstentryauthor = firstentryauthor.replace('"', "");
        message.author.send(firstentrymessage + " Showcase Message By: " + firstentryauthor);
        if (showcasearray[1] != null) {
            let secondentry = showcasearray[1];
            secondentry = secondentry.replace("{", "");
            secondentry = secondentry.replace("}", "");
            secondentry = secondentry.replace("]", "");
            secondentry = secondentry.replace("[", "");
            let secondentryarray = secondentry.split(",");
            let secondentrymessage = secondentryarray[0];
            let secondentryauthor = secondentryarray[1];
            secondentrymessage = secondentrymessage.replace('"message":"', "");
            secondentrymessage = secondentrymessage.replace('"', "");
            secondentryauthor = secondentryauthor.replace('"author":"', "");
            secondentryauthor = secondentryauthor.replace('"', "");
            message.author.send(secondentrymessage + " Showcase Message By: " + secondentryauthor);
        }
        if (showcasearray[2] != null) {
            let thirdentry = showcasearray[2];
            thirdentry = thirdentry.replace("{", "");
            thirdentry = thirdentry.replace("}", "");
            thirdentry = thirdentry.replace("]", "");
            thirdentry = thirdentry.replace("[", "");
            let thirdentryarray = thirdentry.split(",");
            let thirdentrymessage = thirdentryarray[0];
            let thirdentryauthor = thirdentryarray[1];
            thirdentrymessage = thirdentrymessage.replace('"message":"', "");
            thirdentrymessage = thirdentrymessage.replace('"', "");
            thirdentryauthor = thirdentryauthor.replace('"author":"', "");
            thirdentryauthor = thirdentryauthor.replace('"', "");
            message.author.send(thirdentrymessage + " Showcase Message By: " + thirdentryauthor);
        }


    }
}