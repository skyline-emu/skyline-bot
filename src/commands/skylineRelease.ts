import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";
import { Octokit } from "@octokit/rest";

export const command = {
    data: new SlashCommandBuilder()
        .setName("skyline-release")
        .setDescription("The latest release from the specified branch")
        .addStringOption(option =>
            option
                .setName("branch")
                .setDescription("Branch to retrieve latest release from")),
    level: AccessLevel.User,
    async execute(interaction: ChatInputCommandInteraction) {
        const octokit = new Octokit();

        const branch = interaction.options.getString("branch") ?? "master";
        const runs = (await octokit.actions.listWorkflowRunsForRepo({
            owner: "skyline-emu",
            repo: "skyline",
            branch: branch,
            status: "completed",
        })).data;

        if (runs.total_count == 0)
            return interaction.reply({ content: `No GitHub Actions workflow found in '${branch}' branch`, ephemeral: true});

        let selectedRun = null;
        let releaseArtifact = null;
        let debugArtifact = null;
        for (let run of runs.workflow_runs) {
            if (run.name == "CI") {
                const artifacts = (await octokit.rest.actions.listWorkflowRunArtifacts({
                    owner: "skyline-emu",
                    repo: "skyline",
                    run_id: run.id,
                })).data.artifacts;

                for (let artifact of artifacts) {
                    if (artifact.name.endsWith("release.apk")) {
                        releaseArtifact = artifact;
                        if (debugArtifact)
                            break;
                    } else if (artifact.name.endsWith("debug.apk")) {
                        debugArtifact = artifact;
                        if (releaseArtifact)
                            break;
                    }
                }

                if (releaseArtifact != null && debugArtifact != null) {
                    selectedRun = run;
                    break;
                } else {
                    releaseArtifact = null;
                    debugArtifact = null;
                }
            }
        }

        if (selectedRun == null || debugArtifact == null || releaseArtifact == null)
            return interaction.reply({ content: `No CI GitHub Actions workflow found in '${branch}' branch`, ephemeral: true});
		
        const commit = selectedRun.head_commit!;
        let commitTitleIndex = commit.message.indexOf("\n");
        let embed = new EmbedBuilder({
            "title": commitTitleIndex == -1 ? commit.message : commit.message.substring(0, commitTitleIndex),
            "description": commitTitleIndex != -1 ? commit.message.substring(commitTitleIndex + 1) : undefined,
            "url": selectedRun.html_url,
            timestamp: Date.parse(selectedRun.run_started_at!),
            "footer": {
                "text": "A GitHub account is required to download APKs"
            },
            "author": {
                // We use this as a psuedo-heading rather than as an actual authorship field
                "name": `GitHub Actions Build on ${branch}`,
                "icon_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            },
            "fields": [
                {
                    "name": "Release Build (Recommended)",
                    "value": `[Download APK](https://github.com/skyline-emu/skyline/suites/${selectedRun.check_suite_id}/artifacts/${releaseArtifact.id}) — Heavily optimized with limited validation`
                },
                {
                    "name": "Debug Build",
                    "value": `[Download APK](https://github.com/skyline-emu/skyline/suites/${selectedRun.check_suite_id}/artifacts/${debugArtifact.id}) — Extra validation and no optimizations for debugging`
                }
            ]
        });

        await interaction.reply({ embeds: [embed] });
    }
};
