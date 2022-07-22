const http = require("http");
const path = require("path");
const https = require("https");
const express = require("express");
const xml2js = require("xml2js");
const cheerio = require("cheerio");
const SSDP = require("node-ssdp").Client;
const UPNP = require("upnp-device-client");
const bodyParser = require("body-parser");

const app = express();
const ssdpClient = new SSDP();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let xml = "";
let devices = {};
let returnMetaData = {};
let playerStatus = "No player";
let locationUrl = "";
var upnpClient = undefined;

// ==================== pulling upnp devices ====================
ssdpClient.search("ssdp:all");
ssdpClient.on("response", (resp) => {
    if (resp.ST.indexOf("urn:schemas-upnp-org:device:MediaRenderer") >= 0) {
        const gsaReq = http
            .get(resp.LOCATION, function(response) {
                var completeResponse = "";
                response.on("data", function(chunk) {
                    completeResponse += chunk;
                });
                response.on("end", function() {
                    const metaReq = xml2js.parseString(
                        completeResponse,
                        (err, completeResponse) => {
                            if (err) {
                                throw err;
                            }
                            const temp = completeResponse.root.device[0];
                            devices[temp.friendlyName[0]] = {
                                location: resp.LOCATION,
                                deviceType: temp.deviceType ? temp.deviceType[0] : "",
                                friendlyName: temp.friendlyName ? temp.friendlyName[0] : "",
                                manufacturer: temp.manufacturer ? temp.manufacturer[0] : "",
                                ssidName: temp.ssidName ? temp.ssidName[0] : "",
                                uuid: temp.uuid ? temp.uuid[0] : "",
                            };
                        }
                    );
                });
            })
            .on("error", function(e) {
                console.log("problem with request: " + e.message);
            });
    }
});

// ==================== hosting UI ====================
app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// ==================== upnpClient ====================
app.post("/init", (req, res) => {
    const { location } = req.body;

    if (location !== "") {
        upnpClient = new UPNP(location);
        console.log("new device location", location);
    }
    // upnpClient.unsubscribe('AVTransport', listener);
    res.json(`Device location had been set to ${location}`);
});

app.get("/devices", (req, res, next) => {
    let result = [];
    for (const key in devices) {
        result.push(devices[key]);
    }
    res.send(result);
});

app.get("/metadata", (req, res, next) => {
    if (upnpClient) {
        upnpClient.callAction(
            "AVTransport",
            "GetMediaInfo", { InstanceID: 0 },
            (err, result) => {
                if (err) throw err;
                const metaData = result.CurrentURIMetaData;

                if (metaData) {
                    const metaReq = xml2js.parseString(metaData, (err, metadataJson) => {
                        if (err) {
                            throw err;
                        }
                        returnMetaData = metadataJson["DIDL-Lite"]["item"][0];
                    });
                }
            }
        );
    }

    res.send(returnMetaData);
});

app.post("/biography", (req, res) => {
    const { artist } = req.body;

    if (artist) {
        const options = {
            hostname: "www.last.fm",
            port: 443,
            path: `/music/${artist}/+wiki`,
            method: "GET",
        };

        const request = https.request(options, (resp) => {
            let data = "",
                artistData = "";

            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                const regxWhiteSpaces = /^\s+|\s+$|\s+(?=\s)/g;
                const subst = "";
                const $ = cheerio.load(data);
                artistData = $(".wiki-content").text().replace(regxWhiteSpaces, subst);
                if (artistData.length > 0) {
                    res.json({ biography: artistData });
                } else {
                    res.json({ biography: "no data" });
                }
            });
            // res.json({ "biography": artistData })
        });

        request.on("error", (error) => {
            console.error(error);
        });

        request.end();
    }
});

app.post("/actions", (req, res) => {
    if (upnpClient) {
        const { player } = req.body;

        if (player === "status") {
            upnpClient.callAction(
                "AVTransport",
                "GetTransportInfo", { InstanceID: 0 },
                function(err, result) {
                    if (err) throw err;
                    playerStatus = { status: result.CurrentTransportState };
                }
            );
        }
        if (["Play", "Next", "Prev", "Pause"].includes(player)) {
            let options = { InstanceID: 0 };

            if (player === "Play") options.Speed = 1;

            upnpClient.callAction(
                "AVTransport",
                player,
                options,
                function(err, result) {
                    if (err) throw err;
                }
            );
        }
    }
    res.json(playerStatus);
});

var server = app.listen(8080, function() {
    console.log(
        "Server started at http://localhost:%s%s",
        server.address().address,
        server.address().port
    );
});