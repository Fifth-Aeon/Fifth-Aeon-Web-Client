const isLocal = location.host.includes('localhost');
const serverUrn = isLocal ? 'localhost' : 'ws-battleship.heroku.com';
const serverWs = isLocal ? 'ws' : 'wss';
const serverHttp = isLocal ? 'http' : 'https';

console.log(location.host)

export function getWsUrl() {
    return serverWs + '://' + serverUrn;
}

export function getHttpUrl() {
    return serverHttp + '://' + serverUrn;
}