import { MetadataLib } from '../actions/lib'
import { defineStore } from 'pinia'

const lib = new MetadataLib()

export const useMetadataStore = defineStore('metadataStore',{
  state: () => ({
    metadata: {}
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2
  },
  actions: {
    // async fetchDeviceInfo() {
    //   const temp = await lib.fetchDeviceInfo()
    //   this.metadata = {
    //     albumArtist: temp.albumArtist,
    //     albumTitle: temp.albumTitle,
    //     albumUrl : temp.albumUrl,
    //     songTitle: temp.songTitle,
    //     songFormat: temp.songFormat,
    //     songDepth: temp.songDepth,
    //     songQuality: temp.songQuality,
    //     songRate: temp.songRate,
    //     songBitrate: temp.songBitrate,
    //     artist: temp.artist,
    //     album: temp.album,
    //     biography: temp.biography
    //   }
    //   console.log('CHRIS', this.metadata)
    // }
  }
})
