export type metadataType = {
    albumArtist: string,
    albumTitle: string,
    albumUrl: string
    songTitle: string,
    songFormat: string,
    songDepth: number,
    songQuality: string,
    songRate: number,
    songBitrate: number,
    artist: string,
    album: string,
    biography: string,
    streamSource: string
}

export type playerType = {
    status: string
}

export type details = {
    biography: string
}

export class MetadataLib {
    // private deviceUrl: string
    private serverUrl: string = 'http://10.0.4.31:8080'
    private player: playerType = {
        status: 'PAUSED_PLAYBACK'
    }
    private biography: string = 'default biography'
    private defaultData: metadataType = {
        albumArtist: '',
        albumTitle: '',
        albumUrl : '',
        songTitle: '',
        songFormat: '',
        songDepth: 0,
        songQuality: '',
        songRate: 0,
        songBitrate: 0,
        artist: '',
        album: '',
        biography: '',
        streamSource: ''
    }

    constructor() {}

    init(url:string) {
        this.serverUrl = url
    }

    fetchDeviceInfo() {
        fetch(`${this.serverUrl}/data/`)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            this.updateMetadata(data)
        })
        .catch((err) => {
            console.log('error: ' + err)
        })
        return this.defaultData
    }

    fetchPlayerStatus(playerAction: string) {
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        fetch(`${this.serverUrl}/actions/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                player: playerAction
            })
        })
        .then((response) => {
            return response.json()
        })
        .then((data: playerType) => {
            if (data) {
                this.player.status = data.status
            }
        })
        .catch((err) => {
            console.log('error: ' + err)
        })
        return this.player
    }

    postPlayerActions(playerAction: string) {
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        fetch(`${this.serverUrl}/actions/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                player: playerAction
            })
        })
        .catch((err) => {
            console.log('error: ' + err)
        })
    }

    async fetchBiography() {
        const artist = this.urlDecode(this.defaultData.artist)
        const album = this.urlDecode(this.defaultData.albumTitle)

        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        
        // handle extreme cases when unexpected search results happened
        if(artist === 'Various%20Artists') {
            return ''
        }

        await fetch(`${this.serverUrl}/biography/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    artist: artist
                })
            })
            .then((response) => {
                return response.json()
            })
            .then((data: details) => {
                this.updateBiography(data)
            })
            .catch((err) => {
                console.log('error: ' + err)
            })
            return this.biography
        }

    audioQuality(data: any): number {
        let returnAudioQuality = data
        if (!isNaN(returnAudioQuality)) {
            if (data > 24) {
                returnAudioQuality = 24
            }
        }
        if (this.defaultData.streamSource === 'amazon') {
            if (this.defaultData.songQuality === 'HD') {
                returnAudioQuality = 16
            }
        }
        return returnAudioQuality
    }

    bitrate(data: any): number {
        if (!isNaN(data) && data !== undefined) {
            const temp =  data > 1000 ? (data / 1000).toFixed(2) : data
            return temp
        } else {
            return 0
        }
    }

    streamSource(data: string): string {
        let streamSource = ''
        if (data.indexOf('amazon') >= 0) {
            streamSource = 'amazon'
        }
        if (data.indexOf('qobuz') >= 0) {
            streamSource = 'qobuz'
        }
        return streamSource
    }

    urlDecode(str: string): string {
        return encodeURIComponent(str)
    }

    updateMetadata(data: any): metadataType {
        if (data) {
            this.defaultData.songTitle = data['dc:title'] ? data['dc:title'][0] : ''
            this.defaultData.artist = data['upnp:artist'] ? data['upnp:artist'][0] : ''
            this.defaultData.albumUrl = data['upnp:albumArtURI'] ? data['upnp:albumArtURI'][0] : ''
            this.defaultData.albumTitle = data['upnp:album'] ? data['upnp:album'][0] : ''
            this.defaultData.songFormat = data['song:format_s'] ? data['song:format_s'][0] : ''
            this.defaultData.songDepth = data['song:format_s'] ? this.audioQuality(data['song:format_s'][0]) : 0
            this.defaultData.songQuality = data['song:actualQuality'] ? data['song:actualQuality'][0] : ''
            this.defaultData.songRate = data['song:rate_hz'] ? this.bitrate(data['song:rate_hz'][0]) : 0
            this.defaultData.songBitrate = data['song:bitrate'] ? data['song:bitrate'][0] : 0
            this.defaultData.streamSource = this.streamSource(this.defaultData.albumUrl)
        }
        return this.defaultData
    }
    updateBiography = (data: details) => {
        if (data.biography !== 'no data') {
            this.biography = data.biography    
        } else {
            this.biography = ''
        }
    }
}