interface CommandOptions {
    port: string;
}
export default function command(options: CommandOptions): Promise<void>;
export {};
