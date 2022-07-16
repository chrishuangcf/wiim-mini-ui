import {
    PROXY_PORT,
    DEVICE_ID,
    DAAS_ACCESS_TOKEN,
    DAAS_ENDPOINT_DEV,
    DAAS_ENDPOINT_STAGING,
    PROXY_URL
} from './../defaults/constants';

const appConfig = {
    graybox: {
        headers: {
            "Content-Type": "application/json",
            "device_id": DEVICE_ID,
            "daasAccessToken": DAAS_ACCESS_TOKEN,
            "client-type": "graybox"
        }
    },
    daasEndpointDev: DAAS_ENDPOINT_DEV,
    daasEndpointStaging: DAAS_ENDPOINT_STAGING,
    daasEndpoint: "loading...", //  "http://localhost:8085/, // https://10.253.180.101:7002/daasmstoresync
    lineRegistered: [{
        msisdn: "tel:+14255041886", //dev9 14255041839  // dev8 14255041886
        lineId: "undefined",
        email: "xxx"
    }]
};
// 
// http://10.251.104.196:7041 - Polaris
// http://10.255.232.196:7041 - Titan


/////////////////// HTTP METHODS ///////////////////////
export async function HTTP(url: string = '', payload: any = {}, extraHeaders: Object = {}, type: string = "POST")  {

    let headers = () => {
        if (extraHeaders) {
            return {
                ...appConfig.graybox.headers,
                ...extraHeaders
            };
        } else {
            return appConfig.graybox.headers;
        }
    };

    payload = JSON.stringify(payload);

    if (type == "GET") {
        payload = null;
    }

    return window
        .fetch(url, {
            method: type,
            headers: headers(),
            body: payload
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            return response.text().then(function (text) {
                let r;
                try {
                    r = JSON.parse(text);
                } catch (e) {
                    r = text;
                }
                return r;
            });
        })
        .catch((error) => {
            throw {
                code: error.status,
                status: "error",
                isError: true,
                body: {
                    status: error.status,
                    statusText: error.statusText,
                    type: error.type
                }
            };
        });
};