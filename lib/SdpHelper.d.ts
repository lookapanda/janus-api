import { Logger } from './Janus';
export declare class SdpHelper {
    logger: Logger;
    constructor(logger: Logger);
    filterH264Profiles(sdp: string, allowedProfiles: Array<[]> | string | RegExp): string;
    filterDirectCandidates(sdp: any, force?: boolean): any;
    isDirectCandidate(candidateLine: any): boolean;
}
