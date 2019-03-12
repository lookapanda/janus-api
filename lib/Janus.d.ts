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
export interface WebSocketSendOptions {
    compress?: boolean;
    binary?: boolean;
    fin?: boolean;
    mask?: boolean;
}
export declare type WSCallback = (...args: any[]) => void;
export interface WebSocketInterface extends WebSocket {
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView, options: WebSocketSendOptions | WSCallback, cb: WSCallback): void;
}
export declare class Janus<T extends WebSocketInterface> {
    isConnected: boolean;
    ws: T;
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
    addPlugin(plugin: JanusPlugin<T>): Promise<JanusPlugin<T>>;
    transaction(type: string, payload?: any, replyType?: string, timeoutMs?: number): Promise<any>;
    send(type: string, payload: any): Promise<void>;
    destroy(): Promise<void>;
    destroyPlugin(plugin: JanusPlugin<T>): Promise<void>;
    onClose(): void;
    keepAlive(isScheduled?: boolean): void;
    getTransaction(json: any, ignoreReplyType?: boolean): Transaction | void;
    cleanup(): void;
    _cleanupWebSocket(): void;
    _cleanupPlugins(): void;
    _cleanupTransactions(): void;
    private onWsMessage;
    private onWsClose;
}
