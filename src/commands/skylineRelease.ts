import { Message, MessageEmbed } from "discord.js";
import { Command, CommandError, AccessLevel } from "./command";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

/** This command is used to retrieve the most recent release from a specific branch of the Skyline repository */
export class Release extends Command {
    constructor() {
        super("release", "rl", "The latest release from the specified branch\n`rl {Branch}`", AccessLevel.User);
    }

    async run(message: Message, args: string[]): Promise<void> {
        const branch = args[0] ?? "master";
        const runs = (await octokit.actions.listWorkflowRunsForRepo({
            owner: "skyline-emu",
            repo: "skyline",
            branch: branch,
            status: "completed",
        })).data;

        if (runs.total_count == 0)
            throw new CommandError(`No GitHub Actions workflow found in '${branch}' branch`);

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
                    if (artifact.name == "app-release.apk") {
                        releaseArtifact = artifact;
                        if (debugArtifact)
                            break;
                    } else if (artifact.name == "app-debug.apk") {
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
            throw new CommandError(`No CI GitHub Actions workflow found in '${branch}' branch`);

        const commit = selectedRun.head_commit!;
        var commitTitleIndex = commit.message.indexOf("\n");
        let embed = new MessageEmbed({
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

        await message.channel.send({ embeds: [embed] });
    }
}
