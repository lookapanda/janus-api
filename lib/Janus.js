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
const uuid = require("uuid/v4");
const JanusPlugin_1 = require("./JanusPlugin");
const ignoredErrorCodes = [
    458,
    459,
];
class Janus {
    constructor(config, logger) {
        this.onWsClose = () => {
            this.cleanup();
            this.onClose();
        };
        this.ws = undefined;
        this.isConnected = false;
        this.sessionId = undefined;
        this.logger = logger;
        this.transactions = {};
        this.pluginHandles = {};
        this.config = config;
        this.protocol = 'janus-protocol';
        this.sendCreate = true;
        this.adapter = config.adapter;
    }
    connect() {
        if (this.isConnected) {
            return Promise.resolve(this);
        }
        return new Promise((resolve, reject) => {
            this.ws = new this.adapter(this.config.url, this.protocol);
            this.ws.addEventListener('error', (err) => {
                this.logger.error('Error connecting to the Janus WebSockets server...', err);
                this.isConnected = false;
                reject(err);
            });
            this.ws.addEventListener('close', this.onWsClose);
            this.ws.addEventListener('open', () => {
                if (!this.sendCreate) {
                    this.isConnected = true;
                    this.keepAlive(true);
                    return resolve(this);
                }
                const transaction = uuid();
                const request = { janus: 'create', transaction };
                this.transactions[transaction] = {
                    resolve: (json) => {
                        if (json.janus !== 'success') {
                            this.logger.error('Cannot connect to Janus', json);
                            reject(json);
                            return;
                        }
                        this.sessionId = json.data.id;
                        this.isConnected = true;
                        this.keepAlive(true);
                        this.logger.debug('Janus connected, sessionId: ', this.sessionId);
                        resolve(this);
                    },
                    reject,
                    replyType: 'success',
                };
                this.ws.send(JSON.stringify(request));
            });
            this.ws.addEventListener('message', this.onWsMessage);
        });
    }
    addPlugin(plugin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(plugin instanceof JanusPlugin_1.JanusPlugin)) {
                return Promise.reject(new Error('plugin is not a JanusPlugin'));
            }
            const request = plugin.getAttachPayload();
            const json = yield this.transaction('attach', request, 'success');
            if (json.janus !== 'success') {
                this.logger.error('Cannot add plugin', json);
                plugin.error(json);
                throw new Error(json);
            }
            this.pluginHandles[json.data.id] = plugin;
            return plugin.success(this, json.data.id);
        });
    }
    transaction(type, payload, replyType, timeoutMs) {
        if (!replyType) {
            replyType = 'ack';
        }
        const transactionId = uuid();
        return new Promise((resolve, reject) => {
            if (timeoutMs) {
                setTimeout(() => {
                    reject(new Error('Transaction timed out after ' +
                        timeoutMs +
                        ' ms'));
                }, timeoutMs);
            }
            if (!this.isConnected) {
                reject(new Error('Janus is not connected'));
                return;
            }
            const request = Object.assign({}, payload, {
                janus: type,
                session_id: (payload && parseInt(payload.session_id, 10)) ||
                    this.sessionId,
                transaction: transactionId,
            });
            this.transactions[request.transaction] = {
                resolve,
                reject,
                replyType,
                request,
            };
            this.ws.send(JSON.stringify(request));
        });
    }
    send(type, payload) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Janus is not connected'));
                return;
            }
            const request = Object.assign({}, payload, { janus: type, session_id: this.sessionId, transaction: uuid() });
            this.logger.debug('Janus sending', request);
            this.ws.send(JSON.stringify(request), {}, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                return Promise.resolve();
            }
            try {
                yield this.transaction('destroy', {}, 'success', 5000);
                this.cleanup();
            }
            catch (e) {
                this.cleanup();
            }
        });
    }
    destroyPlugin(plugin) {
        return new Promise((resolve, reject) => {
            if (!(plugin instanceof JanusPlugin_1.JanusPlugin)) {
                reject(new Error('plugin is not a JanusPlugin'));
                return;
            }
            if (!this.pluginHandles[plugin.janusHandleId]) {
                reject(new Error('unknown plugin'));
                return;
            }
            this.transaction('detach', {
                plugin: plugin.pluginName,
                handle_id: plugin.janusHandleId,
            }, 'success', 5000)
                .then(() => {
                delete this.pluginHandles[plugin.pluginName];
                plugin.detach();
                resolve();
            })
                .catch((err) => {
                delete this.pluginHandles[plugin.pluginName];
                plugin.detach();
                reject(err);
            });
        });
    }
    onClose() {
        if (!this.isConnected) {
            return;
        }
        this.isConnected = false;
        this.logger.error('Lost connection to the gateway (is it down?)');
    }
    keepAlive(isScheduled) {
        if (!this.ws || !this.isConnected || !this.sessionId) {
            return;
        }
        if (isScheduled) {
            setTimeout(() => {
                this.keepAlive();
            }, this.config.keepAliveIntervalMs);
        }
        else {
            this.transaction('keepalive')
                .then(() => {
                setTimeout(() => {
                    this.keepAlive();
                }, this.config.keepAliveIntervalMs);
            })
                .catch((err) => {
                this.logger.warn('Janus keepalive error', err);
            });
        }
    }
    getTransaction(json, ignoreReplyType = false) {
        const type = json.janus;
        const transactionId = json.transaction;
        if (transactionId &&
            this.transactions.hasOwnProperty(transactionId) &&
            (ignoreReplyType ||
                this.transactions[transactionId].replyType === type)) {
            const ret = this.transactions[transactionId];
            delete this.transactions[transactionId];
            return ret;
        }
    }
    cleanup() {
        this._cleanupPlugins();
        this._cleanupWebSocket();
        this._cleanupTransactions();
    }
    _cleanupWebSocket() {
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            }
        }
        this.ws = undefined;
        this.isConnected = false;
    }
    _cleanupPlugins() {
        Object.keys(this.pluginHandles).forEach((pluginId) => {
            const plugin = this.pluginHandles[pluginId];
            delete this.pluginHandles[pluginId];
            plugin.detach();
        });
    }
    _cleanupTransactions() {
        Object.values(this.transactions).forEach((transaction) => {
            if (transaction.reject) {
                transaction.reject();
            }
        });
        this.transactions = {};
    }
    onWsMessage(messageEvent) {
        let json;
        try {
            json = JSON.parse(messageEvent.data);
        }
        catch (err) {
            this.logger.error('cannot parse message', messageEvent.data);
            return;
        }
        if (json.janus === 'timeout' && json.session_id !== this.sessionId) {
            this.logger.debug('GOT timeout from another websocket');
            return;
        }
        if (json.janus === 'keepalive') {
            return;
        }
        if (json.janus === 'ack') {
            const transaction = this.getTransaction(json);
            if (transaction && transaction.resolve) {
                transaction.resolve(json);
            }
            return;
        }
        if (json.janus === 'success') {
            const transaction = this.getTransaction(json);
            if (!transaction) {
                return;
            }
            const pluginData = json.plugindata;
            if (pluginData === undefined || pluginData === null) {
                transaction.resolve(json);
                return;
            }
            const sender = json.sender;
            if (!sender) {
                transaction.resolve(json);
                this.logger.error('Missing sender for plugindata', json);
                return;
            }
            const pluginHandle = this.pluginHandles[sender];
            if (!pluginHandle) {
                this.logger.error('This handle is not attached to this session', json);
                return;
            }
            transaction.resolve({ data: pluginData.data, json });
            return;
        }
        if (json.janus === 'webrtcup') {
            const sender = json.sender;
            if (!sender) {
                this.logger.warn('Missing sender...');
                return;
            }
            const pluginHandle = this.pluginHandles[sender];
            if (!pluginHandle) {
                this.logger.error('This handle is not attached to this session', sender);
                return;
            }
            pluginHandle.webrtcState(true);
            return;
        }
        if (json.janus === 'hangup') {
            const sender = json.sender;
            if (!sender) {
                this.logger.warn('Missing sender...');
                return;
            }
            const pluginHandle = this.pluginHandles[sender];
            if (!pluginHandle) {
                this.logger.error('This handle is not attached to this session', sender);
                return;
            }
            pluginHandle.webrtcState(false, json.reason);
            pluginHandle.hangup();
            return;
        }
        if (json.janus === 'detached') {
            const sender = json.sender;
            if (!sender) {
                this.logger.warn('Missing sender...');
                return;
            }
            return;
        }
        if (json.janus === 'media') {
            const sender = json.sender;
            if (!sender) {
                this.logger.warn('Missing sender...');
                return;
            }
            const pluginHandle = this.pluginHandles[sender];
            if (!pluginHandle) {
                this.logger.error('This handle is not attached to this session', sender);
                return;
            }
            pluginHandle.mediaState(json.type, json.receiving);
            return;
        }
        if (json.janus === 'slowlink') {
            this.logger.debug('Got a slowlink event on session ' + this.sessionId);
            this.logger.debug(json);
            const sender = json.sender;
            if (!sender) {
                this.logger.warn('Missing sender...');
                return;
            }
            const pluginHandle = this.pluginHandles[sender];
            if (!pluginHandle) {
                this.logger.error('This handle is not attached to this session', sender);
                return;
            }
            pluginHandle.slowLink(json.uplink, json.nacks);
            return;
        }
        if (json.janus === 'error') {
            if (json.error &&
                json.error.code &&
                !ignoredErrorCodes.includes(json.error.code)) {
                this.logger.error('Janus error response' + json);
            }
            const transaction = this.getTransaction(json, true);
            if (transaction && transaction.reject) {
                if (transaction.request) {
                    this.logger.debug('Janus Error: rejecting transaction', transaction.request, json);
                }
                transaction.reject(json);
            }
            return;
        }
        if (json.janus === 'event') {
            const sender = json.sender;
            if (!sender) {
                this.logger.warn('Missing sender...');
                return;
            }
            const pluginData = json.plugindata;
            if (pluginData === undefined || pluginData === null) {
                this.logger.error('Missing plugindata...');
                return;
            }
            const pluginHandle = this.pluginHandles[sender];
            if (!pluginHandle) {
                this.logger.error('This handle is not attached to this session', sender);
                return;
            }
            const data = pluginData.data;
            const transaction = this.getTransaction(json);
            if (transaction) {
                if (data.error_code) {
                    transaction.reject({ data, json });
                }
                else {
                    transaction.resolve({ data, json });
                }
                return;
            }
            pluginHandle.onmessage(data, json);
            return;
        }
        this.logger.warn('Unknown message/event ' +
            json.janus +
            ' on session ' +
            this.sessionId);
        this.logger.debug(json);
    }
}
exports.Janus = Janus;
