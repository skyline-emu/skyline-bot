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
    shortname: string;
    desc:      string;
    access:    AccessLevel;

    constructor(name: string, shortname: string, desc: string, access: AccessLevel)
    {
        this.name      = name
        this.shortname = shortname
        this.desc      = desc
        this.access    = access
    }

    async abstract run(msg: Message, args: string[]): Promise<void>;
}

export class CommandError extends Error {}