import { Command, AccessLevel, CommandError } from "./command";
import { Message, User } from "discord.js";

/** This command is used to ban any amount of users from the server with an optional reason */
export class Ban extends Command {
    constructor() {
        super("ban", null, AccessLevel.Moderator, "Bans a particular user with an optional reason\n`(ban {Users..} {Reason})`", true);
    }

    async run(msg: Message, args: string[]): Promise<void> {
        msg.delete();

        let usersToBan = msg.mentions.users;

        if (!usersToBan.size)
            throw new CommandError("You must mention one or more users to ban");

        for (let i = 0; i <= usersToBan.size; i++)
            args.shift();

        let reason = args.join(" ");

        await Promise.all(usersToBan.map(async (userToBan: User): Promise<void> => {
            await msg.guild.member(userToBan).ban(reason);

            if (reason)
                msg.channel.send(`<@${userToBan.id}> has been banned: ${reason}`);
            else
                msg.channel.send(`<@${userToBan.id}> has been banned`);

            return;
        }));
    }
}
