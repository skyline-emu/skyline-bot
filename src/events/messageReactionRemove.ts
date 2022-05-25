import { DiscordEvent } from "./event";
import { Client, MessageReaction, User, PartialUser } from "discord.js";
import config from "../config.json";

/** This event is used for processing removal of reactions that are used for special behaviors */
export class MessageReactionRemove extends DiscordEvent {
    constructor() {
        super("messageReactionRemove");
    }

    async run(client: Client, reaction: MessageReaction, user: User | PartialUser): Promise<void> {
        config.roleAssignment.forEach(async (item: RoleAssignment) => {
            if (reaction.message.id == item.messageId && (reaction.emoji.id == item.emojiId || reaction.emoji.name == item.emojiId)) {
                let member = await reaction.message.guild?.members.cache.get(user.id)!!;
                member.roles.remove(item.roleId);
            }
        });
    }
}
