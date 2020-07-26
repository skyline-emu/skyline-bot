import { AccessLevel, Command, CommandError } from "./command";
import { Message, MessageEmbed } from "discord.js";
import config from "../config.json";

/** This command is used to display an embed that ties to a particular server rule */
export class Rule extends Command {
    constructor() {
        super("rule", "r", "Sends an embed that corresponds to a rule\n`r {index}`", AccessLevel.User);
    }

    async run(message: Message, args: string[]): Promise<void> {
        if (!args.length)
            throw new CommandError("The index of the rule wasn't specified");

        let ruleId = parseInt(args[0]);
        let embed = new MessageEmbed({ color: "RED" });
        switch (ruleId) {
            case 1:
                embed.title = "Rule #1 - Piracy";
                embed.description = "Asking, linking or helping someone download ROMs or other copyrighted content in any way is **NOT** allowed. **Piracy is completely prohibited**.";
                embed.addField("Why?", "The sharing of [Copyrighted material](https://simple.wikipedia.org/wiki/Copyright) without a license to do so is illegal under the [Berne Convention](https://en.wikipedia.org/wiki/Berne_Convention).", false);
                embed.addField("How does this harm Skyline?", "We intend to be a completely legal emulator which have been proven to be legal by landmark cases such as [Sony Computer Entertainment, Inc. v. Connectix Corp.](https://en.wikipedia.org/wiki/Sony_Computer_Entertainment,_Inc._v._Connectix_Corp.) and [Sony Computer Entertainment America, Inc. v. Bleem LLC](https://itlaw.wikia.org/wiki/Sony_Computer_Entertainment_America_v._Bleem). Supporting users who pirate results in the legality of the emulator to come into question and will likely result in a takedown by the copyright holders.", false);
                break;

            case 2:
                embed.title = "Rule #2 - Respect";
                embed.description = `Be respectful toward other people. It's fine to disagree, it's not fine to insult or attack other people.
                * You may disagree with anyone or anything you like, but you should try to keep it to opinions, and not people.
                * The use of derogatory slurs (Racist, sexist, homophobic, transphobic, etc) is not allowed.`;
                break;

            case 3:
                embed.title = "Rule #3 - Spamming";
                embed.description = `Spamming is not allowed. If you do have rather lengthy messages you want to send, and you feel like it might be considered spam, please do so in <#620658560661192714>.
                * In addition, using a service such as [Pastebin](https://pastebin.com/) or [Hatebin](https://hatebin.com/) is recommended for code-snippets and such.`;
                break;

            case 4:
                embed.title = "Rule #4 - Offtopic";
                embed.description = "Please keep offtopic conversations in <#620658427257028618>.";
                break;

            default:
                throw new CommandError("The specified rule wasn't recognized");
        }

        message.channel.send(embed);
        if (config.deleteTime > 0)
            message.delete({ timeout: config.deleteTime });
    }
}
