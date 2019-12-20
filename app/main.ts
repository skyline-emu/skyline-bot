import { Client, RichEmbed, GuildMember, Snowflake } from "discord.js";
import config                                        from "./config.json";
import * as events                                   from "./events";
import * as commands                                 from "./commands";
import { EventMethod }                               from "./events/event.js";
import { AccessLevel, Command, CommandError }        from "./commands/command.js";

let accessMap = new Map<AccessLevel, Snowflake>
([
    [AccessLevel.Admin,     "545842302409768968"],
    [AccessLevel.Moderator, "546093540166336532"]
])

const client   = new Client();
let commandMap = new Map<string, Command>();
let commandVec = new Array<Command>();

Object.values(events).forEach((eventT) =>
{
    let event: EventMethod = new eventT();

    client.on(event.name, (...args: any) =>
    {
        event.run(client, ...args);
    });
});

Object.values(commands).forEach((commandT) =>
{
    let command: Command = new commandT();

    commandMap.set(command.name,      command);
    commandMap.set(command.shortname, command);
    commandVec.push(command);
});

client.on("message", async msg =>
{
    if (!msg.content.startsWith(config.prefix) || (msg.author.bot)) return;

    let input       = msg.content.split(" ");
    let cmd: string = input[0].substr(config.prefix.length);
    const command   = commandMap.get(cmd);

    if (command != undefined)
    {
        let member: GuildMember = await msg.guild.fetchMember(msg.author);
        if (command.access != AccessLevel.User && !member.roles.has(accessMap.get(command.access)!)) return;

        command.run(msg, input).then(() =>
        {
            msg.delete(config.deleteTime);
        }).catch((e) =>
        {
            let embed = new RichEmbed({ "title": "**An Error was Encountered**" });

            if (e instanceof CommandError)
                embed.setDescription(e.message);
            if (e instanceof Error)
                console.warn(e);
            else
                console.warn(`Caught Error: ${e}`);

            msg.channel.send(embed).then(() =>
            {
                msg.delete(config.deleteTime);
            });
        });
    }
    else if (cmd == "help" || cmd == "h")
    {
        let embed = new RichEmbed({ "title": "**Bot Commands**" });

        for (const command of commandVec)
            embed.addField(`\`${command.name}\` or \`${command.shortname}\``, command.desc, true);
        if (!msg.author.dmChannel)
            msg.author.createDM().then((channel) => { channel.send(embed) });
        else
            msg.author.dmChannel.send(embed);

        msg.delete(config.deleteTime);
    }
});

client.login(config.token);
