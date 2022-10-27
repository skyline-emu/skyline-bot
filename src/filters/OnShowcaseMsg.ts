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
            if (message.content.includes("https://")) {
                let msginfo = {
                    "message": message.content,
                    "author": message.author.username,
                }
                //Find the [] brackets in the showcase.json file
                let showcase = fs.readFileSync("showcase.json", "utf8");
                //If the file is empty, do not use a comma
                showcase = showcase.replace("[", "");
                showcase = showcase.replace("]", "");
                showcase = showcase + "," + JSON.stringify(msginfo);
                //Add the brackets back to the showcase.json file
                showcase = "[" + showcase + "]";
                //If the file has nothing other than the brackets, remove the comma
                showcase = showcase.replace("[,", "[");
                showcase.replace(",]", "]");
                fs.writeFileSync("showcase.json", showcase);
                console.log("Succesfully added "+ message.author.username + "'s message to showcase.json");
            }
        }

    return true;
        }
    }
