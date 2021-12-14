import { Message } from "discord.js";

/** The abstract Filter class is used to provide a common API for all filters */
export abstract class Filter {
    /** The priority of a filter, determines the order it is executed in */
    priority: number;

    constructor(priority: number) {
        this.priority = priority;
    }

    /** 
     * This function is called when this filter's turn comes in the filter stack
     * @param message The message that has to be processed by the filter
     * @returns A boolean stating if this filter has "consumed" this message or not
     */
    abstract run(message: Message): Promise<boolean>;
}
