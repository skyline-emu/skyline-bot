
import { Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { AccessLevel, Command, CommandError } from "./command";
import config from "../config.json";

import { Octokit } from "@octokit/rest";
const octokit = new Octokit();

/** This command is used to check the compatibility of a game on Skyline through the Skyline Games List on GitHub */
export class GameStatus extends Command {
    constructor() {
        super("gamestatus", "gs", "Checks the status of a game on the Skyline Games List\n`gamestatus {Game to Lookup}`", AccessLevel.User);
    }

    async run(message: Message, content: string[]): Promise<void> {
        
        if (content.length == 0)
            throw new CommandError("You must provide the name of the game to search for");

        let gameName = content.join(" ");
        const queryString = gameName + "+repo:skyline-emu/skyline-games-list+type:issues+is:open";
        let gitSearch = await octokit.request("GET /search/issues", { q:queryString });
        let gitSearchTitles = [];

        if (gitSearch.data.items.length <= 0)
            throw new CommandError("No results found! Check for spelling errors, or manually test and add issue here: https://github.com/skyline-emu/skyline-games-list/issues");

        for (const i of gitSearch.data.items)
            gitSearchTitles.push(i.title);

        let embed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle("**Skyline Game Compatibility Check**")
            .setDescription(`<@${message.author.id}> Select your desired game from the list`);
        
        let rowOptions: MessageSelectOptionData[] = [];
        for (const i of gitSearchTitles) {
            if (gitSearchTitles.indexOf(i) == 25) {
                break;
            } else {
                rowOptions.push({
                    label: i,
                    value: i
                });
            }
        }
        
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId("selectionChoices")
                    .setPlaceholder("Choose a game...")
                    .addOptions(rowOptions)
            );

        let botMessage = await message.channel.send({ embeds: [embed], components: [row] });
        
        const collector = botMessage.createMessageComponentCollector({ componentType: "SELECT_MENU", time: 30000 });

        collector.on("collect", async i => {
            let finalSearch = await octokit.request("GET /search/issues", { q:i.values[0] + "+repo:skyline-emu/skyline-games-list+type:issues+is:open" });
            if (i.user.id === message.author.id) {
                let labelNames = "";
                for (const i of finalSearch.data.items[0].labels)
                    labelNames += `\`${i.name}\` `;
                if (labelNames = "")
                    labelNames = "none";
                let body = finalSearch.data.items[0].body!.split("###");
                body.splice(0, 2);
                body.splice(5, 1);
                body.splice(3, 1);
                body[0] = body[0].replace("Tested Build", "");
                body[1] = body[1].replace("Android Version", "Android ");
                body[2] = body[2].replace("SoC type", "using ");
                
                let deviceDetails = [];
                deviceDetails.push(body[1], body[2]);
                
                let build = body[0].replace(/\n|\r/gm, "");
                deviceDetails[1] += " Processor";
                body.splice(0, 3);
                
                let logs = body[1].replace("Log file", "");
                if (logs.indexOf("```") == -1) {
                    botMessage.edit({
                        embeds: [new MessageEmbed()
                            .setColor("BLUE")
                            .setTitle(finalSearch.data.items[0].title)
                            .setURL(finalSearch.data.items[0].html_url)
                            .addField("Labels", labelNames)
                            .addField("Device Details", deviceDetails.join(" ").replace("  ", " ").replace("  ", " ").replace(/\n|\r/gm, ""))
                            .addField("Build", build)
                            .addField("Game Behavior", body[0].replace("Game Behaviour", "").replace(/!/gm, "").replace("- ", ""))
                            .addField("Logs", logs)
                            .setFooter({ text: `Issue #${finalSearch.data.items[0].number}`, iconURL: "https://avatars.githubusercontent.com/u/52578041" })
                        ],
                        components: []
                    });
                } else {
                    botMessage.edit({
                        embeds: [new MessageEmbed()
                            .setColor("BLUE")
                            .setTitle(finalSearch.data.items[0].title)
                            .setURL(finalSearch.data.items[0].html_url)
                            .addField("Labels", labelNames)
                            .addField("Device Details", deviceDetails.join(" ").replace("  ", " ").replace("  ", " ").replace(/\n|\r/gm, ""))
                            .addField("Build", build)
                            .addField("Game Behavior", body[0].replace("Game Behaviour", "").replace(/!/gm, "").replace("- ", ""))
                            .addField("Logs", logs.substring(0, logs.indexOf("```")))
                            .setFooter({ text: `Issue #${finalSearch.data.items[0].number}`, iconURL: "https://avatars.githubusercontent.com/u/52578041" })
                        ],
                        components: []
                    });
                }
            }
        });

        collector.on("end", collected => {
            if (collected.size == 0) {
                botMessage.edit({
                    embeds: [new MessageEmbed()
                        .setTitle("Error")
                        .setDescription("No game selected within 30 seconds! Please try again.")
                        .setColor("RED")
                    ],
                    components: []
                });

                if (botMessage instanceof Message)
                    setTimeout(() => botMessage.delete(), config.deleteTime);
            }
        });
                 
    }
}

