import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { AccessLevel } from "../common/commonFunctions.js";

export const command = {
    data: new SlashCommandBuilder()
        .setName("rule")
        .setDescription("Sends an embed that corresponds to a rule")
        .addIntegerOption(option =>
            option
                .setName("index")
                .setDescription("Index of the rule to retrieve")
                .setRequired(true)),
    level: AccessLevel.User,
    async execute(interaction: ChatInputCommandInteraction) {
        let ruleId = interaction.options.getInteger("index");
    	let embed = new EmbedBuilder().setColor("Red");
        switch (ruleId) {
            case 1:
                embed.setTitle("Rule #1 - Piracy");
                embed.setDescription("Asking, linking or helping someone download ROMs or other copyrighted content in any way is **NOT** allowed. **Piracy is completely prohibited**.");
                embed.addFields(
                    { name: "Why?", value: "The sharing of [Copyrighted material](https://simple.wikipedia.org/wiki/Copyright) without a license to do so is illegal under the [Berne Convention](https://en.wikipedia.org/wiki/Berne_Convention).", inline: false},
                    { name: "How does this harm Skyline?", value: "We intend to be a completely legal emulator which have been proven to be legal by landmark cases such as [Sony Computer Entertainment, Inc. v. Connectix Corp.](https://en.wikipedia.org/wiki/Sony_Computer_Entertainment,_Inc._v._Connectix_Corp.) and [Sony Computer Entertainment America, Inc. v. Bleem LLC](https://itlaw.wikia.org/wiki/Sony_Computer_Entertainment_America_v._Bleem). Supporting users who pirate results in the legality of the emulator to come into question and will likely result in a takedown by the copyright holders.", inline: false}
                );
                break;

            case 2:
                embed.setTitle("Rule #2 - Respect");
                embed.setDescription(`Be respectful toward other people. It's fine to disagree, it's not fine to insult or attack other people.
                * You may disagree with anyone or anything you like, but you should try to keep it to opinions, and not people.
                * The use of derogatory slurs (Racist, sexist, homophobic, transphobic, etc) is not allowed.`);
                break;

            case 3:
                embed.setTitle("Rule #3 - Spamming");
                embed.setDescription(`Spamming is not allowed. If you do have rather lengthy messages you want to send, and you feel like it might be considered spam, please do so in <#620658560661192714>.
                * In addition, using a service such as [Pastebin](https://pastebin.com/) or [Hatebin](https://hatebin.com/) is recommended for code-snippets and such.`);
                break;

            case 4:
                embed.setTitle("Rule #4 - Offtopic");
                embed.setDescription("Please keep offtopic conversations in <#620658427257028618>.");
                break;

            default:
                return interaction.reply({ content: "The specified rule wasn't recognized", ephemeral: true });
        }
    	interaction.reply({embeds: [embed]});
    }
};
