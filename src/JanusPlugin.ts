import { EventEmitter } from 'events';
import * as uuid from 'uuid/v4';
import { Janus, Logger, WebSocketInterface } from './Janus';

export class JanusPlugin<T extends WebSocketInterface> extends EventEmitter {
    public id: string;
    public janus: Janus<T>;
    public janusHandleId: string;
    public pluginName: string;
    public logger: Logger;

    constructor(logger: Logger) {
        super();
        this.id = uuid();
        /** @var Janus */
        this.janus = undefined;
        this.janusHandleId = undefined;
        this.pluginName = undefined;
        this.logger = logger;
    }

    public getAttachPayload() {
        return { plugin: this.pluginName, opaque_id: this.id };
    }

    public transaction(
        message: string,
        additionalFields: any,
        replyType?: string
    ) {
        const payload = { ...additionalFields, handle_id: this.janusHandleId };

        if (!this.janus) {
            return Promise.reject(new Error('JanusPlugin is not connected'));
        }

        return this.janus.transaction(message, payload, replyType);
    }

    public success(janus: Janus<T>, janusHandleId: string) {
        this.janus = janus;
        this.janusHandleId = janusHandleId;

        return this;
    }

    public error(cause: string) {
        // Couldn't attach to the plugin
    }

    public onmessage(data: any, json: any) {
        this.logger.error(
            'Unhandled message from janus in a plugin: ' +
                this.constructor.name,
            data,
            json
        );
    }

    public oncleanup() {
        // PeerConnection with the plugin closed, clean the UI
        // The plugin handle is still valid so we can create a new one
    }

    public detached() {
        // Connection with the plugin closed, get rid of its features
        // The plugin handle is not valid anymore
    }

    public hangup() {
        this.emit('hangup');
    }

    public slowLink() {
        this.emit('slowlink');
    }

    public mediaState(medium: any, on: any) {
        this.emit('mediaState', medium, on);
    }

    public webrtcState(isReady: boolean, cause: string) {
        this.emit('webrtcState', isReady, cause);
    }

    public detach() {
        this.removeAllListeners();
        this.janus = null;
    }
}
