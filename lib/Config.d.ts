export declare class JanusConfig {
    url: string;
    keepAliveIntervalMs: number;
    options: any;
    secret: string;
    sessionListIntervalMs: number;
    constructor(config: any);
}
export declare class JanusAdminConfig extends JanusConfig {
    constructor(config: any);
}
export declare class JanusRoomConfig {
    id: string;
    codec: string;
    record: boolean;
    videoOrientExt: any;
    bitrate: number;
    firSeconds: number;
    publishers: number;
    recordDirectory: string;
    constructor(config: any);
}
