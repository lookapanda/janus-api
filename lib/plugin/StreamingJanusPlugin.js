"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const JanusPlugin_1 = require("../JanusPlugin");
const SdpHelper_1 = require("../SdpHelper");
class StreamingJanusPlugin extends JanusPlugin_1.JanusPlugin {
    constructor(logger, filterDirectCandidates = false) {
        super(logger);
        this.filterDirectCandidates = !!filterDirectCandidates;
        this.janusEchoBody = { audio: true, video: true };
        this.pluginName = 'janus.plugin.streaming';
        this.sdpHelper = new SdpHelper_1.SdpHelper(this.logger);
    }
    create(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = Object.assign({}, parameters, { request: 'create' });
            try {
                const { data, json, } = yield this.transaction('message', { body }, 'success');
                if (data.error_code) {
                    this.logger.error('StreamingJanusPlugin error while create', data);
                    throw new Error('StreamingJanusPlugin error while create');
                }
                return { data, json };
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot create stream', err);
                throw err;
            }
        });
    }
    destroy(id, permanent = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { request: 'destroy', id, permanent };
            try {
                return yield this.transaction('message', { body }, 'success');
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot destroy stream', err);
                throw err;
            }
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { request: 'list' };
            try {
                return yield this.transaction('message', { body }, 'success');
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot list streams', err);
                throw err;
            }
        });
    }
    watch(id) {
        const body = { request: 'watch', id };
        return new Promise((resolve, reject) => {
            this.transaction('message', { body }, 'event')
                .then((param) => {
                const { data, json } = param || {};
                if (!data || data.streaming !== 'event') {
                    this.logger.error('StreamingJanusPlugin watch error ', data, json);
                    throw new Error('StreamingJanusPlugin watch error');
                }
                if (!json.jsep) {
                    this.logger.error('StreamingJanusPlugin watch answer does not contains jsep', data, json);
                    throw new Error('StreamingJanusPlugin watch answer does not contains jsep');
                }
                if (data.result && data.result.status) {
                    this.emit('statusChange', data.result.status);
                }
                const jsep = json.jsep;
                if (this.filterDirectCandidates && jsep.sdp) {
                    jsep.sdp = this.sdpHelper.filterDirectCandidates(jsep.sdp);
                }
                this.emit('jsep', jsep);
                resolve(jsep);
            })
                .catch((err) => {
                this.logger.error('StreamingJanusPlugin, cannot watch stream', err);
                reject(err);
            });
        });
    }
    start(jsep) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { request: 'start' };
            const message = { body };
            if (jsep) {
                message.jsep = jsep;
            }
            try {
                const { data, json } = yield this.transaction('message', message, 'event');
                if (data.result && data.result.status) {
                    this.emit('statusChange', data.result.status);
                }
                return { data, json };
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot start stream', err);
                throw err;
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { request: 'stop' };
            try {
                const { data, json } = yield this.transaction('message', { body }, 'event');
                if (data.result && data.result.status) {
                    this.emit('statusChange', data.result.status);
                }
                return { data, json };
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot start stream', err);
                throw err;
            }
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { request: 'pause' };
            try {
                const { data, json } = yield this.transaction('message', { body }, 'event');
                if (data.result && data.result.status) {
                    this.emit('statusChange', data.result.status);
                }
                return { data, json };
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot start stream', err);
                throw err;
            }
        });
    }
    info(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { request: 'info', id };
            try {
                return yield this.transaction('message', { body }, 'success');
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot start stream', err);
                throw err;
            }
        });
    }
    switch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { request: 'switch', id };
            try {
                return yield this.transaction('message', { body }, 'event');
            }
            catch (err) {
                this.logger.error('StreamingJanusPlugin, cannot start stream', err);
                throw err;
            }
        });
    }
    onmessage(data, json) {
        if (data &&
            data.streaming === 'event' &&
            data.result &&
            data.result.status) {
            this.emit('statusChange', data.result.status);
        }
        else {
            this.logger.error('StreamingJanusPlugin got unknown message', data, json);
        }
    }
    candidate(candidate) {
        if (this.filterDirectCandidates &&
            candidate.candidate &&
            this.sdpHelper.isDirectCandidate(candidate.candidate)) {
            return;
        }
        return this.transaction('trickle', { candidate });
    }
}
exports.StreamingJanusPlugin = StreamingJanusPlugin;
