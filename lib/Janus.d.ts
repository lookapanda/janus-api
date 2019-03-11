import { JanusConfig } from './Config';
import { JanusPlugin } from './JanusPlugin';
export interface Transaction {
    resolve: (...args: any[]) => void;
    reject: (...args: any[]) => void;
    replyType: string;
    request?: any;
}
export interface Logger {
    log: (...args: any[]) => any;
    error: (...args: any[]) => any;
    warn: (...args: any[]) => any;
    info: (...args: any[]) => any;
    debug: (...args: any[]) => any;
}
export declare class Janus {
    isConnected: boolean;
    ws: any;
    sessionId: string;
    logger: Logger;
    transactions: {
        [key: string]: Transaction;
    };
    pluginHandles: any;
    config: JanusConfig;
    protocol: string | string[];
    sendCreate: boolean;
    private adapter;
    constructor(config: JanusConfig, logger: Logger);
    connect(): Promise<this>;
    addPlugin(plugin: JanusPlugin): Promise<JanusPlugin>;
    transaction(type: string, payload?: any, replyType?: string, timeoutMs?: number): Promise<any>;
    send(type: string, payload: any): Promise<void>;
    destroy(): Promise<void>;
    destroyPlugin(plugin: JanusPlugin): Promise<void>;
    onMessage(messageEvent: any): void;
    onClose(): void;
    keepAlive(isScheduled?: boolean): void;
    getTransaction(json: any, ignoreReplyType?: boolean): Transaction | void;
    cleanup(): void;
    _cleanupWebSocket(): void;
    _cleanupPlugins(): void;
    _cleanupTransactions(): void;
}
