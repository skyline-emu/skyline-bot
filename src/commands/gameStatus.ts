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
        let results = gitSearch.data.items;

        if (results.length <= 0){
            interaction.reply("No results found; check for spelling errors, or manually test and add issue [here](https://github.com/skyline-emu/skyline-games-list/issues)");
            return;
        }

        while(results.length > 25) {
            results.pop();
        }
		
        let embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("**Skyline Game Compatibility Check**")
            .setDescription(`<@${interaction.user.id}> Select your desired game from the list`);
		
        let rowOptions: APISelectMenuOption[] = [];
        for (const i of results) {
            rowOptions.push({
                label: i.title,
                value: i.title
            });
        }

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("selectionChoices")
                    .setPlaceholder("Choose a game...")
                    .addOptions(rowOptions));
		
        let interaction2 = await interaction.reply({ embeds: [embed], components: [row] });

        const collector = interaction2.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 30000 });

        collector.on("collect", async i => {
            if (i.user.id != interaction.user.id) {
                i.reply({ content: "This is not your command; create your own command", ephemeral: true});
            } else {
                let issue = results[0];
                for (const j of results) {
                    if (j.title == i.values[0]) {
                        issue = j;
                    }
                }
                let labelNames = "";
                for (const i of issue.labels)
                    labelNames += `\`${i.name}\` `;
                if (labelNames == "")
                    labelNames = "none";
                let body = issue.body!.split("###");
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
                
                let mainEmbed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle(issue.title)
                    .setURL(issue.html_url)
                    .addFields(
                        { name: "Labels", value: labelNames },
                        { name: "Device Details", value: deviceDetails.join(" ").replace("  ", " ").replace("  ", " ").replace(/\n|\r/gm, "") },
                        { name: "Build", value: build },
                        { name: "Game Behavior", value: body[0].replace("Game Behaviour", "").replace(/!/gm, "").replace("- ", "").substring(0, 1021).concat("...") },
                        { name: "Logs", value: logs }
                    )
                    .setFooter({ text: `Issue #${issue.number}`, iconURL: "https://avatars.githubusercontent.com/u/52578041" });

                interaction.editReply({
                    embeds: [mainEmbed], components: []
                });
            }
        });

        collector.on("end", collected => {
            if (collected.size == 0) {
                interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("No game selected within 30 seconds; please try again")
                        .setColor("Red")
                    ], components: []
                });

                setTimeout(() => interaction.deleteReply(), config.deleteTime);
            }
        });

    }
};
