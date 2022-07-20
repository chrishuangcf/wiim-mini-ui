import type { metadataType } from "./types";

let defaultData: metadataType = {
  albumArtist: "",
  albumTitle: "",
  albumUrl: "",
  songTitle: "",
  songFormat: "",
  songDepth: 0,
  songQuality: "",
  songRate: 0,
  songBitrate: 0,
  artist: "",
  album: "",
  biography: "",
  streamSource: "",
};

export const convert = (dataSet: string, data: any): any => {
  let cache = {};
  console.log("CONVERT", dataSet, data);
  switch (dataSet) {
    case "metadata":
      cache = updateMetadata(data);
      break;
    case "deviceInfo":
      cache = data;
      break;
  }
  console.log("CONVERTED", cache);
  return cache;
};

const updateMetadata = (data: any): metadataType => {
  if (data) {
    defaultData.songTitle = data["dc:title"] ? data["dc:title"][0] : "";
    defaultData.artist = data["upnp:artist"] ? data["upnp:artist"][0] : "";
    defaultData.albumUrl = data["upnp:albumArtURI"]
      ? data["upnp:albumArtURI"][0]
      : "";
    defaultData.albumTitle = data["upnp:album"] ? data["upnp:album"][0] : "";
    defaultData.songFormat = data["song:format_s"]
      ? data["song:format_s"][0]
      : "";
    defaultData.songDepth = data["song:format_s"]
      ? audioQuality(data["song:format_s"][0])
      : 0;
    defaultData.songQuality = data["song:actualQuality"]
      ? data["song:actualQuality"][0]
      : "";
    defaultData.songRate = data["song:rate_hz"]
      ? bitrate(data["song:rate_hz"][0])
      : 0;
    defaultData.songBitrate = data["song:bitrate"]
      ? data["song:bitrate"][0]
      : 0;
    defaultData.streamSource = streamSource(defaultData.albumUrl);
  }
  return defaultData;
};

const audioQuality = (data: any): number => {
  let returnAudioQuality = data;
  if (!isNaN(returnAudioQuality)) {
    if (data > 24) {
      returnAudioQuality = 24;
    }
  }
  if (defaultData.streamSource === "amazon") {
    if (defaultData.songQuality === "HD") {
      returnAudioQuality = 16;
    }
  }
  return returnAudioQuality;
};

const bitrate = (data: any): number => {
  if (!isNaN(data) && data !== undefined) {
    const temp = data > 1000 ? (data / 1000).toFixed(2) : data;
    return temp;
  } else {
    return 0;
  }
};

const streamSource = (data: string): string => {
  let streamSource = "";
  if (data.indexOf("amazon") >= 0) {
    streamSource = "amazon";
  }
  if (data.indexOf("qobuz") >= 0) {
    streamSource = "qobuz";
  }
  return streamSource;
};
