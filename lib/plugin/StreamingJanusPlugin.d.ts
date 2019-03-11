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
    destroy(id: string, permanent?: boolean): Promise<any>;
    list(): Promise<any>;
    watch(id: number): Promise<any>;
    start(jsep: RTCSessionDescriptionInit): Promise<{
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
    info(id: string): Promise<any>;
    switch(id: string): Promise<any>;
    onmessage(data: any, json: any): void;
    candidate(candidate: any): Promise<any> | void;
}
