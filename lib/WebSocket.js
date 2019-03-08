"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getWebSocket = () => {
    try {
        return require('ws');
    }
    catch (e) {
        return window.WebSocket;
    }
};
exports.default = getWebSocket;
