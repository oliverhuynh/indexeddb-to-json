import { Database } from '../types';
interface CommandOptions {
    verbose?: boolean;
    stdout?: boolean;
    return?: boolean;
    db?: string;
    store?: string;
    includeStores?: boolean;
    key?: string;
    keyvalue?: string;
}
export default function extract(source: string, options: CommandOptions): Promise<void | Database[]>;
export {};
