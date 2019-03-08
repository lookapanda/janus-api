import { Logger } from '../Janus';
import { JanusPlugin } from '../JanusPlugin';
import { SdpHelper } from '../SdpHelper';
export interface Parameters {
    id?: number;
    name?: string;
    description?: string;
    audio?: boolean;
    video?: boolean;
    is_private?: boolean;
    pin?: number;
    secret?: string;
    permanent?: boolean;
    rtp?: {
        data?: boolean;
        collission?: any;
        srtpsuite?: any;
        srtpcrypto?: any;
    };
    live?: string;
    ondemand?: string;
    rtsp?: any;
}
export declare class StreamingJanusPlugin extends JanusPlugin {
    filterDirectCandidates: boolean;
    janusEchoBody: {
        audio: boolean;
        video: boolean;
    };
    pluginName: string;
    sdpHelper: SdpHelper;
    constructor(logger: Logger, filterDirectCandidates?: boolean);
    create(parameters: Parameters): Promise<{
        data: any;
        json: any;
    }>;
    destroy(id: string, permanent?: boolean): Promise<void>;
    list(): Promise<void>;
    watch(id: string): Promise<any>;
    start(jsep: string): Promise<{
        data: any;
        json: any;
    }>;
    stop(): Promise<{
        data: any;
        json: any;
    }>;
    pause(): Promise<{
        data: any;
        json: any;
    }>;
    info(id: string): Promise<void>;
    switch(id: string): Promise<void>;
    onmessage(data: any, json: any): void;
    candidate(candidate: any): Promise<any> | void;
}
