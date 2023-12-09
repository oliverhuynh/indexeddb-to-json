import { Database } from '../types';
interface CommandOptions {
    cookie?: boolean;
    verbose?: boolean;
    stdout?: boolean;
    return?: boolean;
    db?: string;
    store?: string;
    includeStores?: boolean;
    key?: string;
    keyvalue?: string;
}
export declare function extract_indexed(source: string, options: CommandOptions): Promise<void | Database[]>;
export declare function extract_cookie(source: string, options: CommandOptions): Promise<void | Database[]>;
export default function extract(source: string, options: CommandOptions): Promise<void | Database[]>;
export {};
