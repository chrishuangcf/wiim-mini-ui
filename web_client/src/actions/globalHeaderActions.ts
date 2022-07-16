import {
    PROXY_URL,
    PROXY_PORT
} from './../defaults/constants';

import { HTTP } from './fetchActions'

export async function sendHeadersToProxy(headers : Array<any>, port: number) {
    var url = PROXY_URL + "saveglobalheaders";
    let payload = {
        port: port,
        headers: headers
    }
   await HTTP(url, payload, undefined, "POST");
}
