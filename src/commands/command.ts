import { Message, Snowflake, User, Guild } from "discord.js";
import config from "../config.json";

/** This enumerates all of the access levels a user can have */
export enum AccessLevel {
    User = 0,
    Helper = 1,
    Moderator = 2,
    Admin = 3
}

/** 
 * @param level The AccessLevel to lookup the role of
 * @return The Snowflake that corresponds to the role of the supplied AccessLevel
 */
export function getAccessLevelRole(level: AccessLevel): Snowflake {
    let role = "";
    switch (level) {
        case AccessLevel.Admin:
            role = config.adminRole;
            break;
        case AccessLevel.Moderator:
            role = config.moderatorRole;
            break;
        case AccessLevel.Helper:
            role = config.helperRole;
            break;
    }
    return role;
}

/** 
 * @param user The user to check the permissions of
 * @param guild The guild to check permissions in
 * @param level The access level to check if the user has
 * @returns If the supplied user has the specified access level in the specified guild 
 */
export async function userHasAccess(user: User, guild: Guild, level: AccessLevel): Promise<Boolean> {
    if (level == AccessLevel.User)
        return true;

    let roles = await (await guild?.members.cache.get(user.id)!!).roles;
    for (let index = level; index <= AccessLevel.Admin; index++) {
        let levelRole = getAccessLevelRole(index);
        if (roles.cache.has(levelRole))
            return true;
    }

    return false;
}

/** This class is used to encapsulate all information about a single command */
export abstract class Command {
    /** The name of the command */
    name: string;
    /** An optional shorter name of the command */
    shortName: string | null;
    /** The description of this command */
    description: string;
    /** The AccessLevel required to execute the command */
    access: AccessLevel;

    constructor(name: string, shortname: string | null, description: string, access: AccessLevel) {
        this.name = name;
        this.shortName = shortname;
        this.access = access;
        this.description = description;
    }

    /** 
     * This function is called when this command has been issued by a user
     * @param message The message that triggered this command
     * @param args An array of space-seperated arguments derived from the message
     */
    abstract run(message: Message, args: string[]): Promise<void>;
}

/** This class is used for errors that arise during commands, they're the only error besides DiscordAPIError that is fully reported to a user */
export class CommandError extends Error {
    name = Object(CommandError).name;
}
