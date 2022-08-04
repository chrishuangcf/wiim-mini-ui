import type { metadataType, deviceListType } from "../types/types";
import { SERVER_PORT } from "../constants/Constants";
import { io } from "socket.io-client";

export class Utilities {
  private serverUrl: string = window.location.origin;
  private data: metadataType = {
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
    realTime: "",
    volume: 0,
    loopMode: 0,
  };

  private socket: any;

  constructor() {
    this.socket = io(this.serverUrl);
  }

  init(serverUrl: string) {
    this.serverUrl = `http://${serverUrl}:${SERVER_PORT}`;
    this.socket = io(this.serverUrl);
  }

  async fetchDeviceList() {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.emit("devices");
        this.socket.on("devices", (data: deviceListType) => {
          this.socket.off("devices");
          resolve(data);
        });
      }
    });
  }

  fetchMetadata() {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.emit("metadata");
        this.socket.on("metadata", (data: any) => {
          this.socket.off("metadata");
          resolve(this.updateMetadata(data));
        });
      }
    });
  }

  postInit(url: string) {
    this.socket.emit("init", url);
  }

  postPlayerActions(playerAction: string) {
    if (this.socket) {
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
  }

  async fetchBiography() {
    if (this.socket) {
      if (this.serverUrl) {
        const artist = this.urlDecode(this.data.artist);
        // const album = this.urlDecode(this.data.albumTitle);

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
  }

  audioQuality(data: any, streamSource: string, songQuality: string): number {
    if (this.socket) {
      let returnAudioQuality = data;
      if (!isNaN(returnAudioQuality)) {
        if (data > 24) {
          returnAudioQuality = 24;
        }
      }
      if (streamSource === "prime") {
        if (songQuality === "HD") {
          returnAudioQuality = 16;
        }
      }
      return returnAudioQuality;
    }
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

  urlDecode(str: string): string {
    return encodeURIComponent(str);
  }

  updateMetadata(data: any): metadataType {
    const songQuality = data["song:actualQuality"]
      ? data["song:actualQuality"][0]
      : "";
    const streamSource = data["player:tracksource"] || "";
    if (data) {
      this.data.songTitle = data["dc:title"] ? data["dc:title"][0] : "";
      this.data.albumArtist = data["upnp:albumArtist"]
        ? data["upnp:albumArtist"][0]
        : "";
      this.data.artist = data["upnp:artist"] ? data["upnp:artist"][0] : "";
      this.data.albumUrl = data["upnp:albumArtURI"]
        ? data["upnp:albumArtURI"][0]
        : "";
      this.data.albumTitle = data["upnp:album"] ? data["upnp:album"][0] : "";
      this.data.songFormat = data["song:format_s"]
        ? data["song:format_s"][0]
        : "";
      this.data.songDepth = data["song:format_s"]
        ? this.audioQuality(data["song:format_s"][0], streamSource, songQuality)
        : 0;
      this.data.songQuality = songQuality;
      this.data.songRate = data["song:rate_hz"]
        ? this.frequence(data["song:rate_hz"][0])
        : 0;
      this.data.songBitrate = this.bitrate(
        data["track:bitrate"] ? data["song:bitrate"][0] : 0
      );
      this.data.streamSource = streamSource;
      this.data.songDuration = data["track:duration"];
      this.data.realTime = data["rel:time"];
      this.data.volume = data["player:volume"];
      this.data.loopMode = data["player:loopmode"];

      // local dlna media server
      const currentSong = data["res"][0]["$"];

      if (currentSong?.bitsPerSample) {
        this.data.songDepth = currentSong.bitsPerSample;
      }
      if (currentSong?.bitrate) {
        this.data.songBitrate = this.bitrate(currentSong.bitrate);
      }
      if (currentSong?.sampleFrequency) {
        this.data.songRate = this.frequence(currentSong.sampleFrequency);
      }
    }
    return this.data;
  }
}
