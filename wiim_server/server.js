const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
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
const os = require("os");

// Verbose logging flag
const UPNP_DEBUG =
  process.env.UPNP_DEBUG === "1" || process.env.UPNP_DEBUG === "true";

function logDebug(...args) {
  if (UPNP_DEBUG) {
    console.log("[UPNP_DEBUG]", ...args);
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let xml = "";
let devices = {};
let devicesByLocation = [];
let selectedDevice = undefined;
var upnpClient = undefined;
let serverStartTime = Date.now();

// ==================== Health Check Endpoint ====================
app.get("/health", (req, res) => {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
  const health = {
    status: "ok",
    uptime: uptime,
    timestamp: new Date().toISOString(),
    services: {
      upnp: {
        status: devicesByLocation.length > 0 ? "ok" : "no_devices",
        deviceCount: devicesByLocation.length,
      },
      selectedDevice: {
        status: selectedDevice ? "connected" : "not_selected",
        device: selectedDevice || null,
      },
    },
  };
  res.json(health);
});

// ==================== pulling upnp devices ====================
const upnpClient = require("upnp-client");
let upnpDiscovery = upnpClient();
upnpDiscovery.on("device", (device) => {
  logDebug(
    "UPnP device discovered:",
    device.friendlyName,
    device.UDN,
    device.location
  );
  // Only add MediaRenderer devices
  if (
    device.deviceType &&
    device.deviceType.indexOf("urn:schemas-upnp-org:device:MediaRenderer") >= 0
  ) {
    const deviceInfo = {
      location: device.location,
      manufacturer: device.manufacturer || "",
    };
    const extendedInfo = {
      deviceType: device.deviceType || "",
      friendlyName: device.friendlyName || "",
      ssidName: device.ssidName || "",
      uuid: device.UDN ? device.UDN.replace("uuid:", "") : device.uuid || "",
    };
    if (extendedInfo.uuid) {
      devices[extendedInfo.uuid] = { ...extendedInfo, ...deviceInfo };
      if (!devicesByLocation.find((d) => d.location === deviceInfo.location)) {
        devicesByLocation.push(deviceInfo);
      }
      logDebug(
        "Discovered MediaRenderer (upnp-client):",
        extendedInfo.friendlyName,
        extendedInfo.uuid,
        "manufacturer=",
        deviceInfo.manufacturer
      );
    } else {
      logDebug("Device missing uuid, skipping (upnp-client)");
    }
  }
});
upnpDiscovery.search();

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
      logDebug("Selected device object", selectedDevice);
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
          if (err) {
            logDebug("Metadata action error", err.message);
            return;
          }
          const metadata = result.TrackMetaData;
          if (metadata) {
            const metaReq = xml2js.parseString(
              metadata,
              (err, metadataJson) => {
                if (err) {
                  logDebug("TrackMetaData parse error", err.message);
                  return;
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
        if (err) {
          logDebug("Action error", actions, err.message);
        }
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
