import { Message } from "discord.js";

export function serializeMessage(message : Message) {
    let contents = "";

    if (message.content.length)
        contents += message.content;

    let index = 0;
    if (message.embeds.length) {
        message.embeds.forEach(embed => {
            contents += `\n* Embed #${index++}: ${embed.title}${embed.description ? ` - ${embed.description}` : ""}${embed.image ? `\n* ${embed.image.url}` : ""}`;

            embed.fields.forEach(field => {
                contents += `\n* * ${field.name} - ${field.value}`;
            });

            if (embed.footer)
                contents += `\n* ${embed.footer}`;
        });
    }

    index = 0;
    if (message.attachments.size) {
        message.attachments.forEach(attachment => {
            contents += `\n* Attachment #${index++}: ${attachment.name} (${attachment.size} bytes) - ${attachment.url}`;
        });
    }

    return contents;
}