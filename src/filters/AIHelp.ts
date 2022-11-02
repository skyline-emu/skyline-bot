import { Filter } from "./filter";
import { Message, MessageEmbed } from "discord.js";
import { Wit, log } from "node-wit";
import * as config from "../config.json";

enum Intents {
    KEYS = "wherekeys",
    GAMES = "wheregames",
    DRIVERS = "drivers",
    INSTALL = "installskyline",
    FONTS = "fonts",
    UPDATE_GAME = "updategame",
    COMPATIBILITY = "compatibility",
}

export class AIHelp extends Filter {

    constructor() {
        super(9);
    }

    async run(message: Message): Promise<boolean> {
        if (!message.author.bot) {
            const client = new Wit({ accessToken: config.witToken });
            client.message(message.content, {})
                .then((data) => {
                    if (data.intents[0].confidence > 0.94) {

                        console.log("Yay, got Wit.ai response: " + JSON.stringify(data));

                        switch (data.intents[0].name) {

                            case Intents.KEYS:

                                console.log(message.author.username + " asked for keys");

                                let keyEmbed = new MessageEmbed()
                                    .setTitle("Where Can I get Keys for Skyline?")
                                    .setDescription("You can get keys for Skyline from your nintendo switch. Here is a guide on how to get them from a switch: https://yuzu-emu.org/help/quickstart/#dumping-prodkeys-and-titlekeys ")
                                    .setColor("#ff0000");
                                message.channel.send(({ embeds: [keyEmbed] }));

                                break;
                            case Intents.GAMES:

                                console.log(message.author.username + " asked where to get games");

                                let gameEmbed = new MessageEmbed()
                                    .setTitle("Where Can I get Games for Skyline?")
                                    .setDescription("You can get games for Skyline from your nintendo switch. Here is a guide on how to get them from a switch: https://yuzu-emu.org/help/quickstart/ (Ignore the install steps, the concept for dumping games is the same) ")
                                    .setColor("#ff0000");
                                message.channel.send(({ embeds: [gameEmbed] }));

                                break;
                            case Intents.DRIVERS:

                                console.log(message.author.username + " asked where to get drivers");

                                let driverEmbed = new MessageEmbed()
                                    .setTitle("Where Can I get Drivers for Skyline?")
                                    .setTitle("Where Can I get Drivers for Skyline?")
                                    .setDescription("You can get drivers for Skyline from the <#1006189579243630602> channel. ")
                                    .setColor("#ff0000");
                                message.channel.send(({ embeds: [driverEmbed] }));

                                break;
                            case Intents.INSTALL:

                                console.log(message.author.username + " asked how to install Skyline");

                                let installEmbed = new MessageEmbed()
                                    .setTitle("How do I install Skyline?")
                                    .setDescription("You can download the public version of Skyline from https://skyline-emu.one/. After the download is complete, open the apk file and install it. If you are looking for edge, you can get that here for $5 a month or more: https://ko-fi.com/skyline_emu. After you have subscribed, link your ko-fi account to discord to recive the build and the edge role. ")
                                    .setColor("#ff0000");
                                message.channel.send(({ embeds: [installEmbed] }));

                                break;
                            case Intents.FONTS:

                                console.log(message.author.username + " asked where to get fonts");

                                let fontEmbed = new MessageEmbed()
                                    .setTitle("Where Can I get Fonts for Skyline?")
                                    .setDescription("You need to dump fonts for Skyline from your hacked nintendo switch. You must download the .nro from https://github.com/marysaka/nx-ttf-dumper/releases. After you have downloaded it drag it into the switch folder on your sd card. Then open the .nro by clicking the screenshots icon on the homescreen.")
                                    .setColor("#ff0000");
                                message.channel.send(({ embeds: [fontEmbed] }));

                                break;
                            case Intents.UPDATE_GAME:

                                console.log(message.author.username + " asked how to update games");

                                let updateEmbed = new MessageEmbed()
                                    .setTitle("How do I update games?")
                                    .setDescription("You can update games using the merger in the <#960961451340754954> channel pins. If you have any questions, ask in the <#960961451340754954> channel. ")
                                    .setColor("#ff0000");
                                message.channel.send(({ embeds: [updateEmbed] }));

                                break;
                            case Intents.COMPATIBILITY:

                                console.log(message.author.username + " asked about compatibility");

                                let compatEmbed = new MessageEmbed()
                                    .setTitle("How do I check compatibility?")
                                    .setDescription("You can check compatibility by going to https://github.com/skyline-emu/skyline-games-list/issues and then filtering by labels. You can also type .gs followed by the game name to get the status of a game. ")
                                    .setColor("#ff0000");
                                message.channel.send(({ embeds: [compatEmbed] }));

                                break;

                            default:
                                return;
                        }
                    }
                })
                .catch(console.error);
        }
        return true;
    }
}