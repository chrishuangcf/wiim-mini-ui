import {
    PROXY_URL,
    PROXY_PORT
} from './../defaults/constants';

import { HTTP } from './fetchActions'

export async function fetchUserIpAddress() {
    var url = PROXY_URL + "fetchmyip";
    let result = await HTTP(url, null, undefined, "GET");
    return result;
}

export async function sendProxyRequest() {
    var url = PROXY_URL + "startproxybox/" + PROXY_PORT;
    let result = await HTTP(url, null, undefined, "GET");
    return result;
}

export async function sendProxyStop(port: number) {
    var url = PROXY_URL + "stopproxybox/" + port;
    await HTTP(url, null, undefined, "GET");
}

