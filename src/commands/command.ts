import { Message, Snowflake } from "discord.js";
import config from "../config.json";

export enum AccessLevel {
    User = 0,
    Moderator = 1,
    Admin = 2
}

export function getAccessLevelRole(level: AccessLevel): Snowflake {
    let role = "";
    switch (level) {
    case AccessLevel.Admin:
        role = config.adminRole;
        break;
    case AccessLevel.Moderator:
        role = config.moderatorRole;
        break;
    }
    return role;
}

export abstract class Command {
    name: string;
    access: AccessLevel;
    desc: string;
    shortname: string | null;
    enabled: boolean;

    constructor(
        name: string,
        shortname: string | null,
        access: AccessLevel,
        desc: string,
        enabled: boolean
    ) {
        this.name = name;
        this.shortname = shortname;
        this.access = access;
        this.desc = desc;
        this.enabled = enabled;
    }

    abstract async run(msg: Message, args: string[]): Promise<void>;
}

export class CommandError extends Error {
    name = Object(CommandError).name
}
