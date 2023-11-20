import { IOptions } from 'glob';
export declare function timestampForFilename(): string;
export declare function unique<T>(array: T[]): T[];
export declare function getFolderSizeInMb(path: string): Promise<number>;
export declare function globPromise(pattern: string, options: IOptions): Promise<string[]>;
