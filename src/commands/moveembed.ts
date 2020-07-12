import { Message, RichEmbed, Snowflake, TextChannel, Permissions, GuildChannel } from "discord.js";
import { Command, CommandError, AccessLevel } from "./command";
import config from "../config.json";

/** This command is used to move a specified amount of messages from one channel to another channel or DMs using embeds */
export class MoveEmbed extends Command {
    constructor() {
        super("moveemb","me",AccessLevel.Admin,"Moves the specified amount of messages to another channel using embeds\n`(me {Amount} {Channel/\"dm\"})`",true);
    }

    async run(msg: Message, args: string[]): Promise<void> {
        if (args.length < 3)
            throw new CommandError("Too few arguments were specified");
        
        let numMsg = parseInt(args[1]);
        if (!numMsg)
            throw new CommandError("Invalid amount specified");
        
        let channel;
        if (args[2] == "dm") {
            channel = msg.author.dmChannel ? msg.author.dmChannel : await msg.author.createDM();
        } else {
            let channelId: Snowflake;
            if (args[2].startsWith("<#"))
                channelId = args[2].substring(2, args[2].length - 1);
            else
                channelId = args[2];
            
            channel = msg.client.channels.get(channelId)!!;
            if (!channel)
                throw new CommandError("Invalid channel specified");
            else if (!(channel instanceof TextChannel))
                throw new CommandError(`Invalid channel type: ${channel.type}`);
            
            const channelPermissions = channel.memberPermissions(msg.client.user)!!;
            if (!channelPermissions.has("SEND_MESSAGES"))
                throw new CommandError(`Insufficient permissions to send message in channel: <#${channel.id}>`);
        }

        let embed = new RichEmbed({title: `**Chat from #${(msg.channel as GuildChannel).name}**`});
        
        const messages = (await msg.channel.fetchMessages({ limit: numMsg, before: msg.id })).array().reverse();
        
        for (const message of messages) {
            if (message.content)
                embed.addField(message.author.username, message.content, false);
            
            message.delete();
        }

        channel.send(embed);
        
        const message = await msg.channel.send(new RichEmbed({ title: "Success" }));
        if (message instanceof Message)
            message.delete(config.deleteTime);
    }
}
