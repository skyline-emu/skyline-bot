import { EventMethod } from "./event"
import config from "../config.json"

export class Ready extends EventMethod
{
	constructor()
	{
		super("ready")
	}

	async run(client: any): Promise<void>
	{
		console.log(`Logged in as ${client.user.username}#${client.user.discriminator}!`);
		client.user.setPresence({ game: { type: "WATCHING", name: `you! | ${config.prefix}help` }, status: "online" });
	}
}