import { DiscordEvent } from "./event";
import { Client, MessageReaction, User, PartialUser } from "discord.js";
import config from "../config.json";

/** This event is used for processing addition of reactions that are used for special behaviors */
export class MessageReactionAdd extends DiscordEvent {
    constructor() {
        super("messageReactionAdd");
    }

    async run(client: Client, reaction: MessageReaction, user: User | PartialUser): Promise<void> {
        config.roleAssignment.forEach(async (item: RoleAssignment) => {
            if (reaction.message.id == item.messageId && (reaction.emoji.id == item.emojiId || reaction.emoji.name == item.emojiId)) {
                let member = await reaction.message.guild?.members.cache.get(user.id)!!;
                member.roles.add(item.roleId);
            }
        });
    }
}
