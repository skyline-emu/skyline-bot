import { Command, AccessLevel } from "./command"
import config                   from "../config.json"
import { Message, RichEmbed }   from "discord.js";

export class Ping extends Command {
    constructor() {
        super("ping", "p", AccessLevel.User, "Replies with Pong", true);
    }

    async run(msg: Message, args: string[]): Promise<void>
    {
        const message = await msg.channel.send(`<@${msg.author.id}>`, new RichEmbed({ "title": "Pong" }))

        if (message instanceof Message)
            message.delete(config.deleteTime)
    }
} 
