import { Database } from '../types';
interface CommandOptions {
    verbose?: boolean;
    stdout?: boolean;
    return?: boolean;
    db?: string;
    store?: string;
    includeStores?: boolean;
}
export default function extract(source: string, options: CommandOptions): Promise<void | Database[]>;
export {};
