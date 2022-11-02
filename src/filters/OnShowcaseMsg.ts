import { Filter } from "./filter";
import { Message } from "discord.js";
import fs from "fs";
export class OnShowcaseMsg extends Filter {
    constructor() {
        super(9);
    }
    async run(message: Message<boolean>): Promise<boolean> {
        if (message.channel.id == "1036962169264283678"|| message.channel.id == "986020197146169354") {
            if (message.content.includes("https://")) {
                //If the user is a bot
                if (message.author.bot) {
                    return true;
                }
                let msginfo = {
                    "message": message.content,
                    "author": message.author.username,
                }
                let showcase = fs.readFileSync("showcase.json", "utf8");
                showcase = showcase.replace("[", "");
                showcase = showcase.replace("]", "");
                showcase = showcase + "," + JSON.stringify(msginfo);
                showcase = "[" + showcase + "]";
                showcase = showcase.replace("[,", "[");
                showcase.replace(",]", "]");
                fs.writeFileSync("showcase.json", showcase);
                console.log("Succesfully added "+ message.author.username + "'s message to showcase.json");
            }
            else {
                //If the message has an attachment
                if (message.attachments.size > 0) {
                    message.attachments.forEach(attachment => {
                        //Store each attachment in a varible
                        let msginfo = {
                            "message": attachment.url,
                            "author": message.author.username,
                        }
                        //Only allow up to 2 attachments per message
                        let showcase = fs.readFileSync("showcase.json", "utf8");
                        showcase = showcase.replace("[", "");
                        showcase = showcase.replace("]", "");
                        showcase = showcase + "," + JSON.stringify(msginfo);
                        showcase = "[" + showcase + "]";
                        showcase = showcase.replace("[,", "[");
                        showcase.replace(",]", "]");
                        showcase.replace("\n", "");
                        showcase.replace("\r", "");
                        fs.writeFileSync("showcase.json", showcase);
                        console.log("Succesfully added "+ message.author.username + "'s message to showcase.json");
                    });
                }
            }
        }
        return true;
    }
}