const isLocal = location.host.includes('localhost');
const serverWsUrn = isLocal ? 'localhost:2222' : 'ws-ccg.herokuapp.com';
const serverHttpUrn = isLocal ? 'localhost:4200' : 'ccg-game.firebaseapp.com'
const serverWs = isLocal ? 'ws' : 'wss';
const serverHttp = isLocal ? 'http' : 'https';

export function getWsUrl() {
    return serverWs + '://' + serverWsUrn;
}

export function getHttpUrl() {
    return serverHttp + '://' + serverHttpUrn;
}