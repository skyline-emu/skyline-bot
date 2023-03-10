//@ts-ignore
import config from "../config.json" assert { type: "json" };
import { Events, Message } from "discord.js";

export const event = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        //Attachment-only channel filter
        if (config.attachmentOnlyChannels.find(channel => channel == message.channel.id) && !message.author.bot && message.attachments.size == 0 && !message.content.includes("http://") && !message.content.includes("https://")) {
            let response = await message.reply(`Chatting is not allowed in this channel, your message will be deleted in ${(3 * config.deleteTime)/1000}s`);
            setTimeout(async () => {
                try{
                    await response.delete();
                    await message.delete();
                } catch (err) {
                    console.error(err);
                }
            }, 3 * config.deleteTime);
        }
    }
};
