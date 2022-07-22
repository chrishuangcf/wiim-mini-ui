import type {
  metadataType,
  playerType,
  detailsType,
  deviceListType,
} from "./types";
export class MetadataLib {
  private serverUrl: string = "http://10.0.4.31:8080";
  private player: playerType = {
    status: "PAUSED_PLAYBACK",
  };
  private biography: string = "default biography";
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
  };
  private deviceList: deviceListType = [
    {
      location: "",
      deviceType: "",
      friendlyName: "",
      manufacturer: ",",
      ssidName: ",",
      uuid: "",
    },
  ];

  constructor() {}

  async fetchDeviceList() {
    await fetch(`${this.serverUrl}/devices/`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.deviceList = data;
      })
      .catch((err) => {
        console.log("error: " + err);
      });
    return this.deviceList;
  }

  fetchMetadata() {
    if (this.serverUrl) {
      fetch(`${this.serverUrl}/metadata/`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.updateMetadata(data);
        })
        .catch((err) => {
          console.log("error: " + err);
        });
      return this.defaultData;
    }
  }

  fetchPlayerStatus(playerAction: string) {
    if (this.serverUrl) {
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      fetch(`${this.serverUrl}/actions/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          player: playerAction,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data: playerType) => {
          if (data) {
            this.player.status = data.status;
          }
        })
        .catch((err) => {
          console.log("error: " + err);
        });
      return this.player;
    }
  }

  postInit(url: string) {
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    fetch(`${this.serverUrl}/init/`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        location: url,
      }),
    }).catch((err) => {
      console.log("error: " + err);
    });
  }

  postPlayerActions(playerAction: string) {
    if (this.serverUrl) {
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      fetch(`${this.serverUrl}/actions/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          player: playerAction,
        }),
      }).catch((err) => {
        console.log("error: " + err);
      });
    }
  }

  async fetchBiography() {
    if (this.serverUrl) {
      const artist = this.urlDecode(this.defaultData.artist);
      // const album = this.urlDecode(this.defaultData.albumTitle);

      const storedData = localStorage.getItem(artist);
      if (storedData) {
        this.biography = storedData;
        return this.biography;
      }

      let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // handle extreme cases when unexpected search results happened
      if (artist === "Various%20Artists") {
        return "";
      }

      await fetch(`${this.serverUrl}/biography/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          artist: artist,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data: detailsType) => {
          if (data.biography !== "no data") {
            localStorage.setItem(artist, data.biography);
            this.biography = data.biography;
          } else {
            this.biography = "";
          }
        })
        .catch((err) => {
          console.log("error: " + err);
        });
      return this.biography;
    }
  }

  audioQuality(data: any): number {
    let returnAudioQuality = data;
    if (!isNaN(returnAudioQuality)) {
      if (data > 24) {
        returnAudioQuality = 24;
      }
    }
    if (this.defaultData.streamSource === "amazon") {
      if (this.defaultData.songQuality === "HD") {
        returnAudioQuality = 16;
      }
    }
    return returnAudioQuality;
  }

  bitrate(data: any): number {
    if (!isNaN(data) && data !== undefined) {
      const temp = data > 1000 ? (data / 1000).toFixed(2) : data;
      return temp;
    } else {
      return 0;
    }
  }

  streamSource(data: string): string {
    let streamSource = "";
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
        ? this.audioQuality(data["song:format_s"][0])
        : 0;
      this.defaultData.songQuality = data["song:actualQuality"]
        ? data["song:actualQuality"][0]
        : "";
      this.defaultData.songRate = data["song:rate_hz"]
        ? this.bitrate(data["song:rate_hz"][0])
        : 0;
      this.defaultData.songBitrate = data["song:bitrate"]
        ? data["song:bitrate"][0]
        : 0;
      this.defaultData.streamSource = this.streamSource(
        this.defaultData.albumUrl
      );
    }
    return this.defaultData;
  }
}
