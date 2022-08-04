const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const SSDP = require("node-ssdp").Client;
const UPNP = require("upnp-device-client");

const path = require("path");
const xml2js = require("xml2js");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");

const webServer = http.createServer(app);
var io = require("socket.io")(webServer, {
  cors: {
    origin: "*",
  },
});
const ssdpClient = new SSDP();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let xml = "";
let devices = {};
let devicesByLocation = [];
let selectedDevice = undefined;
var upnpClient = undefined;

// ==================== pulling upnp devices ====================
ssdpClient.search("ssdp:all");
ssdpClient.on("response", (resp) => {
  if (resp.ST.indexOf("urn:schemas-upnp-org:device:MediaRenderer") >= 0) {
    const gsaReq = http
      .get(resp.LOCATION, function (response) {
        var completeResponse = "";
        response.on("data", function (chunk) {
          completeResponse += chunk;
        });
        response.on("end", function () {
          const metaReq = xml2js.parseString(
            completeResponse,
            (err, completeResponse) => {
              if (err) {
                throw err;
              }
              const temp = completeResponse.root.device[0];
              const deviceInfo = {
                location: resp.LOCATION,
                manufacturer: temp.manufacturer ? temp.manufacturer[0] : "",
              };
              const extendedInfo = {
                deviceType: temp.deviceType ? temp.deviceType[0] : "",
                friendlyName: temp.friendlyName ? temp.friendlyName[0] : "",
                ssidName: temp.ssidName ? temp.ssidName[0] : "",
                uuid: temp.uuid ? temp.uuid[0] : "",
              };
              devices[temp.friendlyName[0]] = {
                ...extendedInfo,
                ...deviceInfo,
              };
              devicesByLocation.push(deviceInfo);
            }
          );
        });
      })
      .on("error", function (e) {
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

const trackSource = (spotify, trackSource) => {
  // Spotify specific signature
  if (spotify === "1") {
    return "spotify";
  }

  // BubbleUPnP clients
  if (selectedDevice.manufacturer.indexOf("Bubblesoft") >= 0) {
    return "upnpserver";
  }

  // Other track source based on WiiM Mini Specific properties
  if (trackSource) {
    return trackSource.toLowerCase();
  }

  return "upnpserver";
};

// ==================== upnpClient ====================
io.on("connection", (socket) => {
  socket.broadcast.emit("bridge server started");

  socket.on("init", (location) => {
    if (location !== "") {
      upnpClient = new UPNP(location);
      selectedDevice = devicesByLocation.filter(
        (dev) => dev.location === location
      )[0];
      console.log(`Device XML ${location} had been selected by a client`);
    }
  });

  socket.on("devices", () => {
    let result = [];
    for (const key in devices) {
      result.push(devices[key]);
    }
    socket.emit("devices", result);
  });

  socket.on("metadata", () => {
    let mergeData = {};
    if (upnpClient) {
      upnpClient.callAction(
        "AVTransport",
        selectedDevice.manufacturer.indexOf("Linkplay") >= 0
          ? "GetInfoEx"
          : "GetPositionInfo",
        { InstanceID: 0 },
        (err, result) => {
          if (err) throw err;
          const metadata = result.TrackMetaData;
          if (metadata) {
            const metaReq = xml2js.parseString(
              metadata,
              (err, metadataJson) => {
                if (err) {
                  throw err;
                }
                /* PlayMedium : SONGLIST-NETWORK / RADIO-NETWORK / STATION-NETWORK / UNKOWN
                 *
                 * TrackSource : Prime / Qobuz / SPOTIFY / newTuneIn / iHeartRadio / Deezer / UPnPServer
                 *
                 * LoopMode :
                 * repeat / no shuffle 0
                 * repeat 1 / no shuffle 1
                 * repeat / shuffle 2
                 * no repeat / shuffle 3
                 * no repeat / no shuffle 4
                 * repeat 1 / shuffle 5
                 */

                mergeData = {
                  ...metadataJson["DIDL-Lite"]["item"][0],
                  "track:duration": result.TrackDuration,
                  "rel:time": result.RelTime,
                  "player:playmedium": result.PlayMedium,
                  "player:tracksource": trackSource(
                    result.SpotifyActive,
                    result.TrackSource
                  ),
                  "player:volume": result.CurrentVolume,
                  "player:loopmode": result.LoopMode,
                };
                socket.emit("metadata", mergeData);
              }
            );
          }
        }
      );
    }
  });

  socket.on("actions", (actions) => {
    if (upnpClient) {
      if (actions === "status") {
        upnpClient.callAction(
          "AVTransport",
          "GetTransportInfo",
          { InstanceID: 0 },
          (err, result) => {
            if (err) throw err;
            socket.emit("actions", result.CurrentTransportState);
          }
        );
      }
    }
    if (["Play", "Next", "Prev", "Pause"].includes(actions)) {
      let options = { InstanceID: 0 };

      if (actions === "Play") options.Speed = 1;

      upnpClient.callAction("AVTransport", actions, options, (err, result) => {
        if (err) throw err;
      });
    }
  });

  socket.on("biography", (artist) => {
    if (artist.length > 0) {
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
          artistData = $(".wiki-content")
            .text()
            .replace(regxWhiteSpaces, subst);
          if (artistData.length > 0) {
            socket.emit("biography", artistData);
          } else {
            socket.emit("biography", "no data");
          }
        });
      });

      request.on("error", (error) => {
        console.error(error);
      });

      request.end();
    }
  });

  // socket.on("disconnect", () => {
  //     console.log("user disconnected");
  // });
});

webServer.listen(8080, () => {
  console.log(
    "Web Server started at http://localhost:%s%s",
    webServer.address().address,
    webServer.address().port
  );
});
