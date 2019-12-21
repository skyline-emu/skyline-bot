import { Command, AccessLevel } from "./command"
import { Message }              from "discord.js";

export class Say extends Command
{
    constructor()
    {
        super("say", AccessLevel.Moderator, "Repeats what you say");
    }

    async run(msg: Message, args: string[]): Promise<void>
    {
        msg.delete();
        args.shift();
        msg.channel.send(args.join(" "));
    }
} 
