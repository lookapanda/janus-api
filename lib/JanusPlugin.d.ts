/// <reference types="node" />
import { EventEmitter } from 'events';
import { Janus, Logger, WebSocketInterface } from './Janus';
export declare class JanusPlugin<T extends WebSocketInterface> extends EventEmitter {
    id: string;
    janus: Janus<T>;
    janusHandleId: string;
    pluginName: string;
    logger: Logger;
    constructor(logger: Logger);
    getAttachPayload(): {
        plugin: string;
        opaque_id: string;
    };
    transaction(message: string, additionalFields: any, replyType?: string): Promise<any>;
    success(janus: Janus<T>, janusHandleId: string): this;
    error(cause: string): void;
    onmessage(data: any, json: any): void;
    oncleanup(): void;
    detached(): void;
    hangup(): void;
    slowLink(): void;
    mediaState(medium: any, on: any): void;
    webrtcState(isReady: boolean, cause: string): void;
    detach(): void;
}
