import { DiscordEvent } from "./event";
import { Client, MessageReaction, User, GuildMember } from "discord.js";
import config from "../config.json";

/** This event is used for processing removal of reactions that are used for special behaviors */
export class MessageReactionRemove extends DiscordEvent {
    constructor() {
        super("messageReactionRemove");
    }

    async run(client: Client, reaction: MessageReaction, user: User): Promise<void> {
        config.roleAssignment.forEach(async (item: any) => {
            if (reaction.message.id == item.messageId && reaction.emoji.id == item.emojiId) {
                let member: GuildMember = await reaction.message.guild.fetchMember(user);
                member.removeRole(item.roleId);
            }
        });
    }
}
