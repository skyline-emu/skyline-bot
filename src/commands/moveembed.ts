import { TextChannel, DMChannel, NewsChannel, Message, MessageEmbed } from "discord.js";
import { Command, CommandError, AccessLevel } from "./command";
import config from "../config.json";
import { serializeMessage } from "../common/serializeMessage";
import { assert } from "console";

/** This command is used to move a specified amount of messages from one channel to another channel or DMs using embeds */
export class MoveEmbed extends Command {
    constructor() {
        super("moveembed", "me", "Moves the specified amount of messages to another channel using embeds\n`me {Channel/User} {Amount}`", AccessLevel.Helper);
    }

    async run(message: Message, args: string[]): Promise<void> {
        if (message.channel.type == "dm")
            throw new CommandError("Moving from DM channels is not supported");

        if (args.length < 2)
            throw new CommandError("Too few arguments were specified");

        let messageAmount = parseInt(args[1]);
        if (!messageAmount)
            throw new CommandError("Invalid amount specified");

        let channel, channelDescriptor;
        if (message.mentions.members?.size) {
            let user = message.mentions.users.first()!!;
            channel = user.dmChannel ? user.dmChannel : await user.createDM();
            channelDescriptor = `<@${user.id}>'s DMs`;
        } else if (message.mentions.channels.size) {
            channel = message.mentions.channels.first()!!;
            channelDescriptor = `<#${channel.id}>`;

            const channelPermissions = channel.permissionsFor(message.client.user!!)!!;
            if (!channelPermissions.has("SEND_MESSAGES"))
                throw new CommandError(`Insufficient permissions to send message in channel: <#${channel.id}>`);
        } else {
            throw new CommandError("Destination not specified");
        }

        let messages = new Array<Message>();
        while (messageAmount) {
            let amount = Math.min(messageAmount, 10);
            Array.prototype.push.apply(messages, (await message.channel.messages.fetch({ limit: amount, before: messages.length ? messages[messages.length - 1].id : message.id }, false)).array());
            messageAmount -= amount;
        }
        messages = messages.reverse();

        let embed = new MessageEmbed({ title: `**Chat from <#${message.channel.id}>**` }), left = messages.length;
        while (left) {
            let index = messages.length - left, amount = Math.min(left, 100);
            message.channel.bulkDelete(messages.slice(index, index + amount), true);

            let leftEmbed = amount;
            while (leftEmbed) {
                let amountEmbed = Math.min(leftEmbed, 25);
                index = messages.length - left;

                for (const message of messages.slice(index, index + amountEmbed))
                    embed.addField(message.author.username, serializeMessage(message).substr(0, 1024), false);

                await channel.send(embed);
                embed = new MessageEmbed();

                leftEmbed -= amountEmbed;
            }

            left -= amount;
        }

        const resultMessage = await message.channel.send(new MessageEmbed({ description: `Successfully moved ${messages.length} messages to ${channelDescriptor}` }));
        if (resultMessage instanceof Message)
            resultMessage.delete({ timeout: config.deleteTime });
    }
}
