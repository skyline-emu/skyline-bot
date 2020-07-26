import { Message, MessageEmbed } from "discord.js";
import { Command, CommandError, AccessLevel } from "./command";
import fetch from "node-fetch";

/** This command is used to retrieve the most recent release from a specific branch of the Skyline repository */
export class Release extends Command {
    constructor() {
        super("release", "rl", "The latest release from the specified branch\n`rl {Branch}`", AccessLevel.User);
    }

    async run(message: Message, args: string[]): Promise<void> {
        let commitUrl = new URL("https://api.github.com/repos/skyline-emu/skyline/commits");
        if (args[1])
            commitUrl.searchParams.set("sha", args[1]);

        const commits = await (await fetch(commitUrl)).json();
        if ("message" in commits)
            throw new CommandError(commits["message"]);

        for (let index = 0; index < 2; index++) {
            const suites = (await (await fetch(`https://api.github.com/repos/skyline-emu/skyline/commits/${commits[index]["sha"]}/check-suites`, { headers: { Accept: "application/vnd.github.antiope-preview+json" } })).json())["check_suites"];
            for (const suite of suites) {
                if (suite["status"] == "completed") {
                    let embed = new MessageEmbed({ url: `https://github.com/skyline-emu/skyline/commit/${commits[index]["sha"]}/checks?check_suite_id=${suite["id"]}` });

                    if (args[1])
                        embed.setTitle(`Latest Release from ${args[1]}`);
                    else
                        embed.setTitle("Latest Release");

                    await message.channel.send(embed);
        
                    return;
                }
            }
        }

        throw new CommandError("Cannot find successful build within last two commits");
    }
}
