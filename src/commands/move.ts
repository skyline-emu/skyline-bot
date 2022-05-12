import { Message, MessageEmbed, ChannelLogsQueryOptions, WebhookMessageOptions, MessageAttachment } from "discord.js";
import https from "https";
import { IncomingMessage } from "http";
import { Command, CommandError, AccessLevel } from "./command";
import config from "../config.json";

/** This command is used to move a specified amount of messages from one channel to another using webhooks */
export class Move extends Command {
    constructor() {
        super("move", "m", "Moves the specified amount of messages to another channel using Webhooks\n`m {Channel} ({Amount}/{Last Message ID}) {First Message ID}`", AccessLevel.Helper);
    }

    async run(message: Message, args: string[]): Promise<void> {
        if (message.channel.type == "dm")
            throw new CommandError("Moving from DM channels is not supported");

        if (args.length < 2)
            throw new CommandError("Too few arguments were specified");

        let messages = new Array<Message>();
        if (args.length == 2) {
            let messageAmount = parseInt(args[1]);
            if (!messageAmount)
                throw new CommandError("Invalid amount of messages specified");

            while (messageAmount) {
                let amount = Math.min(messageAmount, 100);
                Array.prototype.push.apply(messages, (await message.channel.messages.fetch({ limit: amount, before: messages.length ? messages[messages.length - 1].id : message.id }, false)).array());
                messageAmount -= amount;
            }

            messages.reverse();
        } else {
            let lastMessage = await message.channel.messages.fetch(args[1], false), firstMessage = await message.channel.messages.fetch(args[2], false);

            if (firstMessage.createdTimestamp >= lastMessage.createdTimestamp)
                throw new CommandError("Last message was sent before the first message");
            if (firstMessage.channel.id != lastMessage.channel.id)
                throw new CommandError("Messages weren't sent in the same channel");

            messages.push(firstMessage);

            while (true) {
                let subset = await message.channel.messages.fetch({ limit: 100, after: messages[messages.length - 1].id }, false);
                if (subset.has(lastMessage.id)) {
                    let flag = false;
                    subset.forEach((value, key) => {
                        if (key == lastMessage.id)
                            flag = true;
                        if (flag)
                            messages.push(value);
                    });
                    break;
                } else {
                    Array.prototype.push.apply(messages, subset.array().reverse());
                }
            }
        }

        if (messages.length > 1000) {
            const confirmMessage = await message.channel.send(new MessageEmbed({ title: `Moving ${messages.length} messages, confirm ?` }));
            await confirmMessage.react("👍");
            await confirmMessage.react("👎");
            try {
                let reaction = (await confirmMessage.awaitReactions((reaction, user) => { return ["👍", "👎"].includes(reaction.emoji.name) && user.id == message.author.id; }, { max: 1, time: 60000, errors: ["time"] })).first()!!;
                if (reaction.emoji.name == "👎")
                    return;
            } catch (e) {
                return;
            } finally {
                await confirmMessage.delete();
            }
        }

        let channel = message.mentions.channels.first();
        if (!channel)
            throw new CommandError("Invalid channel specified");

        let webhook = (await channel.fetchWebhooks()).find((value) => value.name == "SkylineMove") ?? await channel.createWebhook("SkylineMove");

        for (const message of messages) {
            let MessageAttachments = Array<MessageAttachment>();

            for (let messageMessageAttachment of message.attachments.values()) {
                let content: IncomingMessage = await new Promise(async (resolve, reject) => {
                    (await https.get(messageMessageAttachment.url)).on("response", (response: IncomingMessage) => {
                        response ? resolve(response) : reject();
                    });
                });

                MessageAttachments.push(new MessageAttachment(content, messageMessageAttachment.name ?? undefined));
            }

            let options: WebhookMessageOptions & { split?: false } = {
                username: `${message.author.username}`,
                avatarURL: message.author.avatarURL() ?? undefined,
                files: MessageAttachments,
                embeds: message.embeds,
                disableMentions: "all",
            };

            await webhook.send(message.content, options);
        }

        let left = messages.length;
        while (left) {
            let index = messages.length - left, amount = Math.min(left, 100);
            message.channel.bulkDelete(messages.slice(index, index + amount), true);
            left -= amount;
        }

        const resultMessage = await message.channel.send(new MessageEmbed({ title: "Success" }));
        if (resultMessage instanceof Message)
            resultMessage.delete({ timeout: config.deleteTime });
    }
}
