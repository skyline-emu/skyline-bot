import { Filter } from "./filter";
import { Message } from "discord.js";
import config from "../config.json";

/** This filter is triggered when a user sends a message without attachments in a channel marked as attachment-only */
export class attachmentOnly extends Filter {
    constructor() {
        super(9);
    }

    async run(message: Message): Promise<boolean> {
        if(config.attachmentOnlyChannels.find(channel => channel == message.channel.id) &&
        !message.author.bot && message.attachments.size == 0 &&
        !message.content.includes("http://") && !message.content.includes("https://")){
            let response = message.reply(`Chatting is not allowed in this channel, your message will be deleted in ${(3 * config.deleteTime)/1000}s. If you want to reply to media, please do so in a thread.`);
            setTimeout(async () => {  (await response).delete() }, 3 * config.deleteTime);
            setTimeout(async () => {  message.delete() }, 3 * config.deleteTime);
        }
        return true;
    }
}
