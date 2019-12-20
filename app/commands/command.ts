import { Message } from "discord.js";

export enum AccessLevel
{
    User      = 0,
    Moderator = 1,
    Admin     = 2,
    BotDev    = 3
}

export abstract class Command
{
    name:      string;
    access:    AccessLevel;
    desc:      string;
    shortname: string;

    constructor(name: string, access: AccessLevel, desc: string, shortname?: string)
    {
        this.name      = name
        this.access    = access
        this.desc      = desc
        this.shortname = shortname!
    }

    async abstract run(msg: Message, args: string[]): Promise<void>;
}

export class CommandError extends Error {}