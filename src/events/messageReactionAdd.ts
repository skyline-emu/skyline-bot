import { DiscordEvent } from "./event";
import { Client, MessageReaction, User } from "discord.js";
import config from "../config.json";

/** This event is used for processing addition of reactions that are used for special behaviors */
export class MessageReactionAdd extends DiscordEvent {
    constructor() {
        super("messageReactionAdd");
    }

    async run(client: Client, reaction: MessageReaction, user: User): Promise<void> {
        config.roleAssignment.forEach(async (item: any) => {
            if (reaction.message.id == item.messageId && reaction.emoji.id == item.emojiId) {
                let member = await reaction.message.guild.fetchMember(user);
                member.addRole(item.roleId);
            }
        });
    }
}
