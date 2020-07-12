import { Filter } from "./filter";
import { Message } from "discord.js";

/** This filter is purely a passthrough filter that logs any message recieved by the bot */
export class Log extends Filter {
    constructor() {
        super(10);
    }

    async run(message: Message): Promise<boolean> {
        let contents = "";

        if (message.content.length)
            contents += message.content;

        let index = 0;
        if (message.embeds.length) {
            message.embeds.forEach(embed => {
                contents += `\n* Embed #${index++}\n* ${embed.title}${embed.description ? `\n* ${embed.description}` : ""}${embed.image ? `\n* ${embed.image.url}` : ""}`;

                embed.fields.forEach(field => {
                    contents += `\n* * ${field.name} - ${field.value}`;
                });

                if (embed.footer)
                    contents += embed.footer;
            });
        }

        index = 0;
        if (message.attachments.size) {
            message.attachments.forEach(attachment => {
                contents += `\n* Attachment #${index++}: ${attachment.filename} (${attachment.filesize} bytes) - ${attachment.url}`;
            });
        }

        console.log(`${message.author.username}#${message.author.discriminator}: ${contents}`);

        return true;
    }
}
