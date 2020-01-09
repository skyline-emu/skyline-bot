import { Message } from "discord.js";
import { Command } from "../commands/command";

export abstract class Filter
{
    name:     string;
    priority: number;
    enabled:  boolean;

    constructor(name: string, priority: number, enabled: boolean)
    {
        this.name     = name;
        this.priority = priority;
        this.enabled  = enabled;
    }

    async abstract run(msg: Message, command?: Command): Promise<boolean>;
}