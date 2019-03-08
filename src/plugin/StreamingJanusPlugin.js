"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var JanusPlugin_1 = require("../JanusPlugin");
var SdpHelper_1 = require("../SdpHelper");
var StreamingJanusPlugin = /** @class */ (function (_super) {
    __extends(StreamingJanusPlugin, _super);
    function StreamingJanusPlugin(logger, filterDirectCandidates) {
        if (filterDirectCandidates === void 0) { filterDirectCandidates = false; }
        var _this = _super.call(this, logger) || this;
        _this.filterDirectCandidates = !!filterDirectCandidates;
        _this.janusEchoBody = { audio: true, video: true };
        _this.pluginName = 'janus.plugin.streaming';
        _this.sdpHelper = new SdpHelper_1.SdpHelper(_this.logger);
        return _this;
    }
    StreamingJanusPlugin.prototype.create = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var body, _a, data, json, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = __assign({}, parameters, { request: 'create' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transaction('message', { body: body }, 'success')];
                    case 2:
                        _a = _b.sent(), data = _a.data, json = _a.json;
                        if (data.error_code) {
                            this.logger.error('StreamingJanusPlugin error while create', data);
                            throw new Error('StreamingJanusPlugin error while create');
                        }
                        return [2 /*return*/, { data: data, json: json }];
                    case 3:
                        err_1 = _b.sent();
                        this.logger.error('StreamingJanusPlugin, cannot create stream', err_1);
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StreamingJanusPlugin.prototype.destroy = function (id, permanent) {
        if (permanent === void 0) { permanent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var body, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = { request: 'destroy', id: id, permanent: permanent };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transaction('message', { body: body }, 'success')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        this.logger.error('StreamingJanusPlugin, cannot destroy stream', err_2);
                        throw err_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StreamingJanusPlugin.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = { request: 'list' };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transaction('message', { body: body }, 'success')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        this.logger.error('StreamingJanusPlugin, cannot list streams', err_3);
                        throw err_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StreamingJanusPlugin.prototype.watch = function (id) {
        var _this = this;
        var body = { request: 'watch', id: id };
        return new Promise(function (resolve, reject) {
            _this.transaction('message', { body: body }, 'event')
                .then(function (param) {
                var _a = param || {}, data = _a.data, json = _a.json;
                if (!data || data.streaming !== 'event') {
                    _this.logger.error('StreamingJanusPlugin watch error ', data, json);
                    throw new Error('StreamingJanusPlugin watch error');
                }
                if (!json.jsep) {
                    _this.logger.error('StreamingJanusPlugin watch answer does not contains jsep', data, json);
                    throw new Error('StreamingJanusPlugin watch answer does not contains jsep');
                }
                if (data.result && data.result.status) {
                    _this.emit('statusChange', data.result.status);
                }
                var jsep = json.jsep;
                if (_this.filterDirectCandidates && jsep.sdp) {
                    jsep.sdp = _this.sdpHelper.filterDirectCandidates(jsep.sdp);
                }
                _this.emit('jsep', jsep);
                resolve(jsep);
            })["catch"](function (err) {
                _this.logger.error('StreamingJanusPlugin, cannot watch stream', err);
                reject(err);
            });
        });
    };
    StreamingJanusPlugin.prototype.start = function (jsep) {
        return __awaiter(this, void 0, void 0, function () {
            var body, message, _a, data, json, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = { request: 'start' };
                        message = { body: body };
                        if (jsep) {
                            message.jsep = jsep;
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transaction('message', message, 'event')];
                    case 2:
                        _a = _b.sent(), data = _a.data, json = _a.json;
                        if (data.result && data.result.status) {
                            this.emit('statusChange', data.result.status);
                        }
                        return [2 /*return*/, { data: data, json: json }];
                    case 3:
                        err_4 = _b.sent();
                        this.logger.error('StreamingJanusPlugin, cannot start stream', err_4);
                        throw err_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StreamingJanusPlugin.prototype.stop = function () {
        var _this = this;
        var body = { request: 'stop' };
        return this.transaction('message', { body: body }, 'event')
            .then(function (_a) {
            var data = _a.data, json = _a.json;
            if (data.result && data.result.status) {
                _this.emit('statusChange', data.result.status);
            }
            return { data: data, json: json };
        })["catch"](function (err) {
            _this.logger.error('StreamingJanusPlugin, cannot start stream', err);
            throw err;
        });
    };
    StreamingJanusPlugin.prototype.pause = function () {
        var _this = this;
        var body = { request: 'pause' };
        return this.transaction('message', { body: body }, 'event')
            .then(function (_a) {
            var data = _a.data, json = _a.json;
            if (data.result && data.result.status) {
                _this.emit('statusChange', data.result.status);
            }
            return { data: data, json: json };
        })["catch"](function (err) {
            _this.logger.error('StreamingJanusPlugin, cannot start stream', err);
            throw err;
        });
    };
    StreamingJanusPlugin.prototype.info = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var body, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = { request: 'info', id: id };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transaction('message', { body: body }, 'success')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _a.sent();
                        this.logger.error('StreamingJanusPlugin, cannot start stream', err_5);
                        throw err_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StreamingJanusPlugin.prototype["switch"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var body, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = { request: 'switch', id: id };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transaction('message', { body: body }, 'event')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_6 = _a.sent();
                        this.logger.error('StreamingJanusPlugin, cannot start stream', err_6);
                        throw err_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StreamingJanusPlugin.prototype.onmessage = function (data, json) {
        if (data &&
            data.streaming === 'event' &&
            data.result &&
            data.result.status) {
            this.emit('statusChange', data.result.status);
        }
        else {
            this.logger.error('StreamingJanusPlugin got unknown message', data, json);
        }
    };
    StreamingJanusPlugin.prototype.candidate = function (candidate) {
        if (this.filterDirectCandidates &&
            candidate.candidate &&
            this.sdpHelper.isDirectCandidate(candidate.candidate)) {
            return;
        }
        return this.transaction('trickle', { candidate: candidate });
    };
    return StreamingJanusPlugin;
}(JanusPlugin_1.JanusPlugin));
exports.StreamingJanusPlugin = StreamingJanusPlugin;
module.exports = StreamingJanusPlugin;
