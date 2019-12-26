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
    shortname: string | null;

    constructor(name: string, shortname: string | null, access: AccessLevel, desc: string)
    {
        this.name      = name
        this.shortname = shortname
        this.access    = access
        this.desc      = desc
    }

    async abstract run(msg: Message, args: string[]): Promise<void>;
}

export class CommandError extends Error {}