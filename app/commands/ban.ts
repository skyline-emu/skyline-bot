import { Command, AccessLevel, CommandError } from "./command"
import { Message, User }                      from "discord.js";

export class Ban extends Command
{
    constructor()
    {
        super("execute", null, AccessLevel.Moderator, "Executes the mentioned user for their crimes");
    }

    async run(msg: Message, args: string[]): Promise<void>
    {
        msg.delete();

        let usersToBan = msg.mentions.users;

        if (usersToBan == null) throw new CommandError("You must mention a user(s)");

        for (let i = 0; i == usersToBan.size; i++) args.shift();
        let reason = args.join(" ");

        usersToBan.forEach((userToBan: User) =>
        {
            msg.channel.send(`<@${userToBan.id}> has been executed for their crimes. "${reason}"`);
            msg.guild.member(userToBan).ban(reason);
        });
    }
}