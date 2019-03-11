"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JanusConfig {
    constructor(config) {
        const { url, keepAliveIntervalMs, options, adapter } = config;
        this.url = url;
        this.keepAliveIntervalMs = keepAliveIntervalMs;
        this.options = options;
        this.adapter = adapter;
    }
}
exports.JanusConfig = JanusConfig;
class JanusAdminConfig extends JanusConfig {
    constructor(config) {
        super(config);
        const { secret, sessionListIntervalMs } = config;
        this.secret = secret;
        this.sessionListIntervalMs = sessionListIntervalMs;
    }
}
exports.JanusAdminConfig = JanusAdminConfig;
class JanusRoomConfig {
    constructor(config) {
        const { id, codec, record, videoOrientExt, bitrate, firSeconds, publishers, recordDirectory, } = config;
        this.id = id;
        this.codec = codec;
        this.record = record;
        this.videoOrientExt = videoOrientExt;
        this.bitrate = bitrate;
        this.firSeconds = firSeconds;
        this.publishers = publishers;
        this.recordDirectory = recordDirectory;
    }
}
exports.JanusRoomConfig = JanusRoomConfig;
