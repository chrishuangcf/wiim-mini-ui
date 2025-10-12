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
// Instance of UPNP device client for the currently selected device
var mediaRendererClient = undefined;
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
// ==================== SSDP Discovery (node-ssdp) ====================
const { Client: SSDPClient } = require("node-ssdp");
// Bind to all interfaces; if issues arise you can specify { explicitSocketBind: true }
const ssdpInterfaces = (process.env.SSDP_INTERFACES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ssdpClient = new SSDPClient({
  reuseAddr: true,
  explicitSocketBind:
    process.env.SSDP_EXPLICIT_BIND === "1" ||
    process.env.SSDP_EXPLICIT_BIND === "true" ||
    false,
  interfaces: ssdpInterfaces.length ? ssdpInterfaces : undefined,
});
logDebug(
  "SSDP client init",
  JSON.stringify({
    explicitSocketBind: ssdpClient.options.explicitSocketBind,
    interfaces: ssdpInterfaces,
  })
);

let discoveryStats = {
  searches: 0,
  lastSearchAt: null,
  responses: 0,
  lastResponseAt: null,
  devices: 0,
};

function fetchAndRegisterDevice(location) {
  // Avoid re-fetching same location
  if (devicesByLocation.find((d) => d.location === location)) {
    return;
  }
  const protocol = location.startsWith("https") ? https : http;
  logDebug("Fetching device description", location);
  protocol
    .get(location, (resp) => {
      let data = "";
      resp.on("data", (chunk) => (data += chunk));
      resp.on("end", () => {
        xml2js.parseString(data, (err, result) => {
          if (err || !result || !result.root || !result.root.device) {
            logDebug("Failed to parse device XML", location, err && err.message);
            return;
          }
            const device = result.root.device[0];
            const deviceType = device.deviceType && device.deviceType[0];
            if (
              !deviceType ||
              deviceType.indexOf("urn:schemas-upnp-org:device:MediaRenderer") < 0
            ) {
              return;
            }
            const udnRaw = device.UDN ? device.UDN[0] : "";
            const uuid = udnRaw.replace("uuid:", "");
            if (!uuid) return;
            const friendlyName = device.friendlyName ? device.friendlyName[0] : "";
            const manufacturer = device.manufacturer ? device.manufacturer[0] : "";
            const deviceInfo = { location, manufacturer };
            const extendedInfo = {
              deviceType,
              friendlyName,
              ssidName: "", // not available via generic SSDP fetch
              uuid,
            };
            devices[uuid] = { ...extendedInfo, ...deviceInfo };
            devicesByLocation.push(deviceInfo);
            discoveryStats.devices = Object.keys(devices).length;
            logDebug(
              "Discovered MediaRenderer (SSDP):",
              friendlyName,
              uuid,
              "manufacturer=",
              manufacturer
            );
            io.emit("device:discovered", devices[uuid]);
      });
    });
    })
    .on("error", (e) => logDebug("Device fetch error", location, e.message));
}

ssdpClient.on("response", (headers, statusCode, rinfo) => {
  discoveryStats.responses++;
  discoveryStats.lastResponseAt = new Date().toISOString();
  // Normalize header keys (node-ssdp may lower-case them)
  const normalized = {};
  Object.keys(headers || {}).forEach((k) => {
    normalized[k.toLowerCase()] = headers[k];
  });
  const location =
    normalized["location"] || headers.LOCATION || headers.Location;
  if (location) {
    logDebug(
      "SSDP response",
      JSON.stringify({
        from: rinfo && rinfo.address,
        st: normalized["st"],
        usn: normalized["usn"],
        location,
      })
    );
    fetchAndRegisterDevice(location);
  } else {
    logDebug("SSDP response missing location header", headers);
  }
});

// Some devices send NOTIFY with LOCATION; capture those too
ssdpClient.on("advertise-alive", (headers) => {
  const location =
    headers.LOCATION || headers.Location || headers.location || headers.Location;
  if (location) {
    logDebug("NOTIFY alive", location);
    fetchAndRegisterDevice(location);
  }
});
ssdpClient.on("advertise-bye", (headers) => {
  const udn = headers.USN || headers.usn;
  if (!udn) return;
  const uuid = udn.replace(/uuid:([^:]+).*/, "$1");
  if (devices[uuid]) {
    const location = devices[uuid].location;
    logDebug("Device bye", uuid, location);
    delete devices[uuid];
    devicesByLocation = devicesByLocation.filter((d) => d.location !== location);
    discoveryStats.devices = Object.keys(devices).length;
    io.emit("device:removed", uuid);
  }
});

// Periodic search for MediaRenderer devices
const SEARCH_TARGETS = [
  "urn:schemas-upnp-org:device:MediaRenderer:1",
  "urn:schemas-upnp-org:service:AVTransport:1",
  "urn:schemas-upnp-org:service:ContentDirectory:1",
  "upnp:rootdevice",
  "ssdp:all",
];

function performSearch() {
  discoveryStats.searches++;
  discoveryStats.lastSearchAt = new Date().toISOString();
  SEARCH_TARGETS.forEach((st) => {
    try {
  ssdpClient.search(st);
  logDebug("Sent SSDP M-SEARCH", st, "(#" + discoveryStats.searches + ")");
    } catch (e) {
      logDebug("SSDP search error", st, e.message);
    }
  });
}
performSearch();
setInterval(performSearch, 15000); // every 15s to reduce chatter

app.get("/discovery-debug", (req, res) => {
  res.json({
    stats: discoveryStats,
    devices: Object.values(devices),
    locations: devicesByLocation,
    targets: SEARCH_TARGETS,
  });
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
      mediaRendererClient = new UPNP(location);
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
    if (mediaRendererClient) {
      mediaRendererClient.callAction(
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
    if (mediaRendererClient) {
      if (actions === "status") {
        mediaRendererClient.callAction(
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

      mediaRendererClient.callAction("AVTransport", actions, options, (err, result) => {
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

function startServer(port = 8080, maxAttempts = 5) {
  webServer.listen(port, () => {
    const addr = webServer.address();
    console.log(
      "Web Server started at http://localhost:%s%s",
      addr && addr.address !== '::' ? addr.address : 'localhost',
      addr && addr.port
    );
  });
  webServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
      console.log(`Port ${port} in use, retrying on ${port + 1}...`);
      setTimeout(() => {
        startServer(port + 1, maxAttempts - 1);
      }, 250);
    } else {
      console.error('Server failed to start', err);
      process.exit(1);
    }
  });
}

startServer();
