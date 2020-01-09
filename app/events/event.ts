export abstract class EventMethod
{
    name:    string;
    enabled: boolean;

    constructor(name: string, enabled: boolean)
    {
        this.name    = name;
        this.enabled = enabled;
    }

    async abstract run(client: any, ...args: any): Promise<void>;
}