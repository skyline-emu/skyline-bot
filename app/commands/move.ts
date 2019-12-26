import { Command, CommandError, AccessLevel }                                                         from "./command";
import { Message, RichEmbed, Snowflake, TextChannel, Permissions, WebhookMessageOptions, Attachment } from "discord.js";
import config                                                                                         from "../config.json";
import https                                                                                          from "https";
import { IncomingMessage }                                                                            from "http";

export class Move extends Command
{
    constructor()
    {
        super("move", "m", AccessLevel.Admin, "Moves the specified amount of messages to another channel using Webhooks `(m {Amount} {Channel})`");
    }
    
    async run(msg: Message, args: string[]): Promise<void>
    {
        if (args.length < 3)
            throw new CommandError("Too few arguments were specified");

        let numMsg = parseInt(args[1]);

        if (!numMsg)
            throw new CommandError("Invalid amount specified");

        let channelSf: Snowflake

        if (args[2].startsWith("<#"))
            channelSf = args[2].substring(2, args[2].length - 1);
        else
            channelSf = args[2];

        let channel = msg.client.channels.get(channelSf);

        if (!channel)
            throw new CommandError("Invalid channel specified");
        else if (!(channel instanceof TextChannel))
            throw new CommandError(`Invalid channel type: ${channel.type}`);

        const channelPermissions: Permissions = channel.memberPermissions(msg.client.user)!!

        if (!channelPermissions.has('MANAGE_WEBHOOKS'))
            throw new CommandError(`Insufficient permissions to manage webhooks in channel: <#${channel.id}>`);

        let webhook = await channel.createWebhook("SkylineMove", "");

        const messages = (await msg.channel.fetchMessages({ limit: numMsg, before: msg.id })).array().reverse();

        for (const message of messages)
        {
            let attachments: Attachment[] = [];

            for (let messageAttachment of message.attachments.values())
            {
                let content : IncomingMessage = await new Promise(async (resolve, reject) => {
                    (await https.get(messageAttachment.url)).on("response", (response: IncomingMessage) => {
                        response ? resolve(response) : reject()
                    })
                })
                attachments.push(new Attachment(content, messageAttachment.filename));
            }

            let options: WebhookMessageOptions =
            {
                username: `${message.author.username}#${message.author.discriminator}`,
                avatarURL: message.author.avatarURL,
                files:     attachments
            };

            await webhook.send(message.content, options);
        }

        await msg.channel.bulkDelete(messages);
        await webhook.delete();

        const message = await msg.channel.send(new RichEmbed({ "title": "Success" }));

        if (message instanceof Message)
            message.delete(config.deleteTime);
    }
} 
