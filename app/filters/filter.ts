import { Message } from "discord.js";
import { Command } from "../commands/command";

export abstract class Filter
{
    name:     string;
    priority: number;

    constructor(name: string, priority: number)
    {
        this.name     = name;
        this.priority = priority;
    }

    async abstract run(msg: Message, command?: Command): Promise<boolean>;
}