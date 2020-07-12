import { Command, AccessLevel, CommandError } from "./command";
import { Message, Snowflake } from "discord.js";

export class Say extends Command {
    constructor() {
        super("say", "s", AccessLevel.Moderator, "Repeats what you say\n`say {Message}`", true);
    }

    async run(message: Message, content: string[]): Promise<void> {
        message.delete();

        if (content.length == 0)
            throw new CommandError("You must provide a message to say");

        let channel: any;

        if (content[0].startsWith("<#")) {
            let channelId: Snowflake = content[0].substring(2, content[0].length - 1);
            channel = message.client.channels.get(channelId);

            content.shift();
        } else if (content[0].startsWith("<@!")) {
            let userId: Snowflake = content[0].substring(3, content[0].length - 1);
            channel = await message.client.fetchUser(userId);

            content.shift();
        } else {
            channel = message.channel;
        }

        channel.send(content.join(" "));
    }
}
