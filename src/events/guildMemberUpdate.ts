//@ts-ignore
import config from "../config.json" assert { type: "json" };
import { Events, GuildMember } from "discord.js";

export const event = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember: GuildMember, newMember: GuildMember) {
        let edge = newMember.guild.roles.cache.get(config.edgeRole)!;
        let exEdge = newMember.guild.roles.cache.get(config.exEdgeRole)!;

        if (!oldMember.roles.cache.has(edge.id) && newMember.roles.cache.has(edge.id)) {
            await oldMember.roles.remove(exEdge);
        }
        if (oldMember.roles.cache.has(edge.id) && !newMember.roles.cache.has(edge.id)) {
            await oldMember.roles.add(exEdge);
        }
    }
};
