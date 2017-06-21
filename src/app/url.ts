const isLocal = location.host.includes('localhost');
const serverWsUrn = isLocal ? 'localhost:2222' : 'ws-battleship.herokuapp.com';
const serverHttpUrn = isLocal ? 'localhost:4200' : 'battleship.williamritson.com'
const serverWs = isLocal ? 'ws' : 'wss';
const serverHttp = isLocal ? 'http' : 'https';

export function getWsUrl() {
    return serverWs + '://' + serverWsUrn;
}

export function getHttpUrl() {
    return serverHttp + '://' + serverHttpUrn;
}