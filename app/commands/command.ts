import { Message } from "discord.js";

export abstract class Command {
    name: string;
    shortname: string;
    desc: string;

    constructor(name: string, shortname: string, desc: string) {
        this.name = name
        this.shortname = shortname
        this.desc = desc
    }

    async abstract run(msg: Message, args: string[]): Promise<void>;
}

export class CommandError extends Error {}