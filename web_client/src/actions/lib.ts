import type {
  metadataType,
  playerType,
  detailsType,
  deviceListType,
} from "../types/types";
import { SERVER_URL, SERVER_PORT } from "@/constants/Constants";
import { io } from "socket.io-client";

export class Utilities {
  private serverUrl: string = `http://${SERVER_URL}:${SERVER_PORT}`;
  private defaultData: metadataType = {
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
    songDuration: "",
  };

  private socket: any;

  constructor() {
    this.socket = io(this.serverUrl);
  }

  async fetchDeviceList() {
    return new Promise((resolve, reject) => {
      this.socket.emit("devices");
      this.socket.on("devices", (data: deviceListType) => {
        this.socket.off("devices");
        resolve(data);
      });
    });
  }

  fetchMetadata() {
    return new Promise((resolve, reject) => {
      this.socket.emit("metadata");
      this.socket.on("metadata", (data: any) => {
        this.socket.off("metadata");
        resolve(this.updateMetadata(data));
      });
    });
  }

  postInit(url: string) {
    this.socket.emit("init", url);
  }

  postPlayerActions(playerAction: string) {
    if (this.serverUrl) {
      return new Promise((resolve, reject) => {
        this.socket.emit("actions", playerAction);
        this.socket.on("actions", (data: any) => {
          this.socket.off("actions");
          resolve(data);
        });
      });
    }
  }

  async fetchBiography() {
    if (this.serverUrl) {
      const artist = this.urlDecode(this.defaultData.artist);
      // const album = this.urlDecode(this.defaultData.albumTitle);

      const storedData = localStorage.getItem(artist);
      if (storedData) {
        return storedData;
      }

      // handle extreme cases when unexpected search results happened
      if (artist === "Various%20Artists") {
        return "";
      }

      return new Promise((resolve, reject) => {
        this.socket.emit("biography", artist);
        this.socket.on("biography", (data: any) => {
          this.socket.off("biography");

          if (data !== "no data") {
            localStorage.setItem(artist, data);
            resolve(data);
          } else {
            resolve("");
          }
        });
      });
    }
  }

  audioQuality(data: any, streamSource: string, songQuality: string): number {
    let returnAudioQuality = data;
    if (!isNaN(returnAudioQuality)) {
      if (data > 24) {
        returnAudioQuality = 24;
      }
    }
    if (streamSource === "amazon") {
      if (songQuality === "HD") {
        returnAudioQuality = 16;
      }
    }
    return returnAudioQuality;
  }

  frequence(data: any): number {
    if (!isNaN(data) && data !== undefined) {
      const temp = data > 1000 ? (data / 1000).toFixed(2) : data;
      return temp;
    } else {
      return 0;
    }
  }

  bitrate(data: any): number {
    if (!isNaN(data) && data !== undefined) {
      const temp = data > 1000 ? (data / 100000).toFixed(2) : data;
      return temp;
    } else {
      return 0;
    }
  }

  streamSource(data: string): string {
    let streamSource = "default";
    if (data.indexOf("amazon") >= 0) {
      streamSource = "amazon";
    }
    if (data.indexOf("qobuz") >= 0) {
      streamSource = "qobuz";
    }
    if (data.indexOf("i.scdn.co") >= 0) {
      streamSource = "spotify";
    }
    return streamSource;
  }

  urlDecode(str: string): string {
    return encodeURIComponent(str);
  }

  updateMetadata(data: any): metadataType {
    const songQuality = data["song:actualQuality"]
      ? data["song:actualQuality"][0]
      : "";
    const streamSource = this.streamSource(data["upnp:albumArtURI"][0]);
    if (data) {
      this.defaultData.songTitle = data["dc:title"] ? data["dc:title"][0] : "";
      this.defaultData.albumArtist = data["upnp:albumArtist"]
        ? data["upnp:albumArtist"][0]
        : "";
      this.defaultData.artist = data["upnp:artist"]
        ? data["upnp:artist"][0]
        : "";
      this.defaultData.albumUrl = data["upnp:albumArtURI"]
        ? data["upnp:albumArtURI"][0]
        : "";
      this.defaultData.albumTitle = data["upnp:album"]
        ? data["upnp:album"][0]
        : "";
      this.defaultData.songFormat = data["song:format_s"]
        ? data["song:format_s"][0]
        : "";
      this.defaultData.songDepth = data["song:format_s"]
        ? this.audioQuality(data["song:format_s"][0], streamSource, songQuality)
        : 0;
      this.defaultData.songQuality = songQuality;
      this.defaultData.songRate = data["song:rate_hz"]
        ? this.frequence(data["song:rate_hz"][0])
        : 0;
      this.defaultData.songBitrate = this.bitrate(
        data["song:bitrate"] ? data["song:bitrate"][0] : 0
      );
      this.defaultData.streamSource = streamSource;

      // local dlna media server
      const currentSong = data["res"][0]["$"];

      if (currentSong?.bitsPerSample) {
        this.defaultData.songDepth = currentSong.bitsPerSample;
      }
      if (currentSong?.bitrate) {
        this.defaultData.songBitrate = this.bitrate(currentSong.bitrate);
      }
      if (currentSong?.sampleFrequency) {
        this.defaultData.songRate = this.frequence(currentSong.sampleFrequency);
      }
    }
    return this.defaultData;
  }
}
