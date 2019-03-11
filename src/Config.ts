export interface JanusConfigInterface {
    url: string;
    keepAliveIntervalMs?: number;
    options?: any;
    secret?: string;
    sessionListIntervalMs?: number;
    adapter: any;
}
export class JanusConfig {
    public url: string;
    public keepAliveIntervalMs: number;
    public options: any;
    public secret: string;
    public sessionListIntervalMs: number;
    public adapter: any;

    constructor(config: JanusConfigInterface) {
        const {
            url,
            keepAliveIntervalMs = 30 * 1000,
            options,
            adapter,
        } = config;

        this.url = url;
        this.keepAliveIntervalMs = keepAliveIntervalMs;
        this.options = options;
        this.adapter = adapter;
    }
}

export class JanusAdminConfig extends JanusConfig {
    constructor(config: any) {
        super(config);
        const { secret, sessionListIntervalMs } = config;

        this.secret = secret;
        this.sessionListIntervalMs = sessionListIntervalMs;
    }
}

export class JanusRoomConfig {
    public id: string;
    public codec: string;
    public record: boolean;
    public videoOrientExt: any;
    public bitrate: number;
    public firSeconds: number;
    public publishers: number;
    public recordDirectory: string;

    constructor(config: any) {
        const {
            id,
            codec,
            record,
            videoOrientExt,
            bitrate,
            firSeconds,
            publishers,
            recordDirectory,
        } = config;

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
