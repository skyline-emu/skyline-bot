import { Command, AccessLevel, CommandError } from "./command";
import { Message, Snowflake } from "discord.js";

export class Say extends Command {
    constructor() {
        super("say", "s", "Sends a message from the bot\n`say ({User}/{Channel} - Optional) {Message}`", AccessLevel.Moderator);
    }

    async run(message: Message, content: string[]): Promise<void> {
        message.delete();

        if (content.length == 0)
            throw new CommandError("You must provide a message to say");

        let channel: any;

        if (content[0].startsWith("<#")) {
            let channelId: Snowflake = content[0].substring(2, content[0].length - 1);
            channel = message.client.channels.fetch(channelId);

            content.shift();
        } else if (content[0].startsWith("<@!")) {
            let userId: Snowflake = content[0].substring(3, content[0].length - 1);
            channel = await message.client.users.fetch(userId);

            content.shift();
        } else {
            channel = message.channel;
        }

        channel.send(content.join(" "));
    }
}
