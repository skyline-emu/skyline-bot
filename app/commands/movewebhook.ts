import { Command, CommandError, AccessLevel } from "./command"
import config from "../config.json"
import { Message, RichEmbed, Snowflake, TextChannel, Permissions, WebhookMessageOptions } from "discord.js";

export class MoveWebhook extends Command {
    constructor() {
        super("move", AccessLevel.Admin, "Moves the specified amount of messages to another channel using Webhooks `(mw {Amount} {Channel})`", "mwh")
    }
    async run(msg: Message, args: string[]): Promise<void> {
        if (args.length < 3)
            throw new CommandError("Too few arguments were specified")

        let numMsg = parseInt(args[1])
        if (!numMsg)
            throw new CommandError("Invalid amount specified")

        let channelSf: Snowflake
        if (args[2].startsWith("<#")) {
            channelSf = args[2].substring(2, args[2].length-1)
        } else
            channelSf = args[2]

        let channel = msg.client.channels.get(channelSf)
        if (!channel)
            throw new CommandError("Invalid channel specified")
        else if(!(channel instanceof TextChannel))
            throw new CommandError(`Invalid channel type: ${channel.type}`)

        const channelPermissions: Permissions = channel.memberPermissions(msg.client.user)!!
        if(!channelPermissions.has('MANAGE_WEBHOOKS'))
            throw new CommandError(`Insufficient permissions to manage webhooks in channel: <#${channel.id}>`)

        let webhook = await channel.createWebhook("SkylineMove", "")
        const messages = (await msg.channel.fetchMessages({limit: numMsg, before: msg.id})).array().reverse()
        for(const message of messages) {
            let options: WebhookMessageOptions = {}
            if(args[3] == "true")
                options.username = `${message.author.username}#${message.author.discriminator}`
            else
                options.username = message.author.username
            options.avatarURL = message.author.avatarURL
            let content = message.content
            for(const attachment of message.attachments.values())
                content += ` (${attachment.url})`
            if(content)
                await webhook.send(content, options)
        }

        await msg.channel.bulkDelete(messages)
        await webhook.delete()
        const message = await msg.channel.send(new RichEmbed({ "title": "Success" }))
        if(message instanceof Message)
            message.delete(config.deleteTime)
    }
} 
