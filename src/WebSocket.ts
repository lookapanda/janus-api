const getWebSocket = () => {
    try {
        return require('ws');
      } catch (e) {
        // this is browser
        return (window as any).WebSocket;
      }
}

export default getWebSocket;
