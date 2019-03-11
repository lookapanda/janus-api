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
export class StreamingJanusPlugin extends JanusPlugin {
    public filterDirectCandidates: boolean;
    public janusEchoBody: { audio: boolean; video: boolean };
    public pluginName: string;
    public sdpHelper: SdpHelper;
    constructor(logger: Logger, filterDirectCandidates: boolean = false) {
        super(logger);
        this.filterDirectCandidates = !!filterDirectCandidates;
        this.janusEchoBody = { audio: true, video: true };
        this.pluginName = 'janus.plugin.streaming';
        this.sdpHelper = new SdpHelper(this.logger);
    }

    public async create(parameters: Parameters) {
        const body = { ...parameters, request: 'create' };

        try {
            const {
                data,
                json,
            }: { data?: any; json?: any } = await this.transaction(
                'message',
                { body },
                'success'
            );
            if (data.error_code) {
                this.logger.error(
                    'StreamingJanusPlugin error while create',
                    data
                );
                throw new Error('StreamingJanusPlugin error while create');
            }
            return { data, json };
        } catch (err) {
            this.logger.error(
                'StreamingJanusPlugin, cannot create stream',
                err
            );
            throw err;
        }
    }

    public async destroy(id: string, permanent: boolean = false) {
        const body = { request: 'destroy', id, permanent };

        try {
            return await this.transaction('message', { body }, 'success');
        } catch (err) {
            this.logger.error(
                'StreamingJanusPlugin, cannot destroy stream',
                err
            );
            throw err;
        }
    }

    public async list() {
        const body = { request: 'list' };

        try {
            return await this.transaction('message', { body }, 'success');
        } catch (err) {
            this.logger.error('StreamingJanusPlugin, cannot list streams', err);
            throw err;
        }
    }

    public watch(id: string) {
        const body = { request: 'watch', id };

        return new Promise(
            (
                resolve: (...args: any[]) => void,
                reject: (err: Error) => void
            ) => {
                this.transaction('message', { body }, 'event')
                    .then((param: any) => {
                        const { data, json }: any = param || {};

                        if (!data || data.streaming !== 'event') {
                            this.logger.error(
                                'StreamingJanusPlugin watch error ',
                                data,
                                json
                            );
                            throw new Error('StreamingJanusPlugin watch error');
                        }
                        if (!json.jsep) {
                            this.logger.error(
                                'StreamingJanusPlugin watch answer does not contains jsep',
                                data,
                                json
                            );
                            throw new Error(
                                'StreamingJanusPlugin watch answer does not contains jsep'
                            );
                        }

                        if (data.result && data.result.status) {
                            this.emit('statusChange', data.result.status);
                        }

                        const jsep = json.jsep;
                        if (this.filterDirectCandidates && jsep.sdp) {
                            jsep.sdp = this.sdpHelper.filterDirectCandidates(
                                jsep.sdp
                            );
                        }

                        this.emit('jsep', jsep);
                        resolve(jsep);
                    })
                    .catch((err: Error) => {
                        this.logger.error(
                            'StreamingJanusPlugin, cannot watch stream',
                            err
                        );
                        reject(err);
                    });
            }
        );
    }

    public async start(jsep: RTCSessionDescriptionInit) {
        const body = { request: 'start' };
        const message: any = { body };
        if (jsep) {
            message.jsep = jsep;
        }

        try {
            const { data, json }: any = await this.transaction(
                'message',
                message,
                'event'
            );
            if (data.result && data.result.status) {
                this.emit('statusChange', data.result.status);
            }
            return { data, json };
        } catch (err) {
            this.logger.error('StreamingJanusPlugin, cannot start stream', err);
            throw err;
        }
    }

    public async stop() {
        const body = { request: 'stop' };

        try {
            const { data, json }: any = await this.transaction(
                'message',
                { body },
                'event'
            );
            if (data.result && data.result.status) {
                this.emit('statusChange', data.result.status);
            }
            return { data, json };
        } catch (err) {
            this.logger.error('StreamingJanusPlugin, cannot start stream', err);
            throw err;
        }
    }

    public async pause() {
        const body = { request: 'pause' };

        try {
            const { data, json }: any = await this.transaction(
                'message',
                { body },
                'event'
            );
            if (data.result && data.result.status) {
                this.emit('statusChange', data.result.status);
            }
            return { data, json };
        } catch (err) {
            this.logger.error('StreamingJanusPlugin, cannot start stream', err);
            throw err;
        }
    }

    public async info(id: string) {
        const body = { request: 'info', id };

        try {
            return await this.transaction('message', { body }, 'success');
        } catch (err) {
            this.logger.error('StreamingJanusPlugin, cannot start stream', err);
            throw err;
        }
    }

    public async switch(id: string) {
        const body = { request: 'switch', id };

        try {
            return await this.transaction('message', { body }, 'event');
        } catch (err) {
            this.logger.error('StreamingJanusPlugin, cannot start stream', err);
            throw err;
        }
    }

    public onmessage(data: any, json: any) {
        if (
            data &&
            data.streaming === 'event' &&
            data.result &&
            data.result.status
        ) {
            this.emit('statusChange', data.result.status);
        } else {
            this.logger.error(
                'StreamingJanusPlugin got unknown message',
                data,
                json
            );
        }
    }

    public candidate(candidate: any): Promise<any> | void {
        if (
            this.filterDirectCandidates &&
            candidate.candidate &&
            this.sdpHelper.isDirectCandidate(candidate.candidate)
        ) {
            return;
        }

        return this.transaction('trickle', { candidate });
    }
}
