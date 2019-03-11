"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const uuid = require("uuid/v4");
class JanusPlugin extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.id = uuid();
        this.janus = undefined;
        this.janusHandleId = undefined;
        this.pluginName = undefined;
        this.logger = logger;
    }
    getAttachPayload() {
        return { plugin: this.pluginName, opaque_id: this.id };
    }
    transaction(message, additionalFields, replyType) {
        const payload = Object.assign({}, additionalFields, { handle_id: this.janusHandleId });
        if (!this.janus) {
            return Promise.reject(new Error('JanusPlugin is not connected'));
        }
        return this.janus.transaction(message, payload, replyType);
    }
    success(janus, janusHandleId) {
        this.janus = janus;
        this.janusHandleId = janusHandleId;
        return this;
    }
    error(cause) {
    }
    onmessage(data, json) {
        this.logger.error('Unhandled message from janus in a plugin: ' +
            this.constructor.name, data, json);
    }
    oncleanup() {
    }
    detached() {
    }
    hangup() {
        this.emit('hangup');
    }
    slowLink() {
        this.emit('slowlink');
    }
    mediaState(medium, on) {
        this.emit('mediaState', medium, on);
    }
    webrtcState(isReady, cause) {
        this.emit('webrtcState', isReady, cause);
    }
    detach() {
        this.removeAllListeners();
        this.janus = null;
    }
}
exports.JanusPlugin = JanusPlugin;
