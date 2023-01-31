//@ts-ignore
import config from "../config.json" assert { type: "json" };
import { ActionRowBuilder, APISelectMenuOption, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";
import { Octokit } from "@octokit/rest";

export const command = {
    data: new SlashCommandBuilder()
        .setName("game-status")
        .setDescription("Checks the status of a game on the Skyline Games List")
        .addStringOption(option =>
            option
                .setName("game-name")
                .setDescription("Game to look up")
                .setRequired(true)),
    level: AccessLevel.User,
    async execute(interaction: ChatInputCommandInteraction) {
        const octokit = new Octokit();
        const gameName = interaction.options.getString("game-name");
        const queryString = gameName + "+repo:skyline-emu/skyline-games-list+type:issues+is:open";
        let gitSearch = await octokit.request("GET /search/issues", { q:queryString });
        let gitSearchTitles = [];

        if (gitSearch.data.items.length <= 0){
            interaction.reply("No results found! Check for spelling errors, or manually test and add issue [here](https://github.com/skyline-emu/skyline-games-list/issues).");
            return;
        }

        for (const i of gitSearch.data.items)
            gitSearchTitles.push(i.title);
		
        let embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("**Skyline Game Compatibility Check**")
            .setDescription(`<@${interaction.user.id}> Select your desired game from the list`);
		
        let rowOptions: APISelectMenuOption[] = [];
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

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("selectionChoices")
                    .setPlaceholder("Choose a game...")
                    .addOptions(rowOptions)
            );
		
        let interaction2 = await interaction.reply({ embeds: [embed], components: [row] });

        const collector = interaction2.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 30000 });

        collector.on("collect", async i => {
            let finalSearch = await octokit.request("GET /search/issues", { q:i.values[0] + "+repo:skyline-emu/skyline-games-list+type:issues+is:open" });
            let labelNames = "";
            for (const i of finalSearch.data.items[0].labels)
                labelNames += `\`${i.name}\` `;
            if (labelNames == "")
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
            if (!logs.includes("http")) {
                logs = "no logs provided";
            } else {
                logs = logs.replace(logs.substring(logs.indexOf("```") + 1, logs.lastIndexOf("```")), "");
                logs = logs.replace("\n````", "");
                logs = logs.replace(logs.substring(logs.indexOf("``") + 1, logs.lastIndexOf("``")), "");
            }
			
            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle(finalSearch.data.items[0].title)
                    .setURL(finalSearch.data.items[0].html_url)
                    .addFields(
                        { name: "Labels", value: labelNames },
                        { name: "Device Details", value: deviceDetails.join(" ").replace("  ", " ").replace("  ", " ").replace(/\n|\r/gm, "") },
                        { name: "Build", value: build },
                        { name: "Game Behavior", value: body[0].replace("Game Behaviour", "").replace(/!/gm, "").replace("- ", "") },
                        { name: "Logs", value: logs },
                    )
                    .setFooter({ text: `Issue #${finalSearch.data.items[0].number}`, iconURL: "https://avatars.githubusercontent.com/u/52578041" })
                ], components: []
            });
        });

        collector.on("end", collected => {
            if (collected.size == 0) {
                interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("No game selected within 30 seconds! Please try again.")
                        .setColor("Red")
                    ], components: []
                });

                setTimeout(() => interaction.deleteReply(), config.deleteTime);
            }
        });

    }
};
