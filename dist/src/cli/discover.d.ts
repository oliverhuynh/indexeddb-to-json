import { IndexedDBRoot } from '../types';
interface CommandOptions {
    csv?: boolean;
    stdout?: boolean;
    return?: boolean;
    includeDatabaseCounts?: boolean;
}
export default function discover(options: CommandOptions): Promise<void | IndexedDBRoot[]>;
export {};
