export type metadataType = {
  albumArtist: string;
  albumTitle: string;
  albumUrl: string;
  songTitle: string;
  songFormat: string;
  songDepth: number;
  songQuality: string;
  songRate: number;
  songBitrate: number;
  artist: string;
  album: string;
  biography: string;
  streamSource: string;
  songDuration: string;
  realTime: string;
  volume: number;
  loopMode: number;
};

export type playerType = {
  status: string;
};

export type detailsType = {
  biography: string;
};

export type upnpDeviceType = {
  location: string;
  deviceType: string;
  friendlyName: string;
  manufacturer: string;
  ssidName: string;
  uuid: string;
};

export type deviceListType = upnpDeviceType[];
