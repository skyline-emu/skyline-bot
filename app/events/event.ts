export abstract class EventMethod
{
    name: string;

    constructor(name: string)
    {
        this.name = name;
    }

    async abstract run(client: any, ...args: any): Promise<void>;
}