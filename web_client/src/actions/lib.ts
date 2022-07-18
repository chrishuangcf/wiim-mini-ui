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
    biography: string
}

export type detailsDataType = {
    biography: string
}

export type playerType = {
    status: string
}

export class MetadataLib {
    // private deviceUrl: string
    private serverUrl: string = 'http://10.0.4.31:8080'
    private player: playerType = {
        status: 'PAUSED_PLAYBACK'
    }
    private detailsData: detailsDataType = {
        biography: 'default biography'
    }
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
        biography: ''
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

    async fetchBiography() {
        const artist = this.urlDecode(this.defaultData.artist)
        const album = this.urlDecode(this.defaultData.albumTitle)

        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
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
            .then((data: string) => {
                this.updateBiography(data)
            })
            .catch((err) => {
                console.log('error: ' + err)
            })
        return this.detailsData
    }

    audioQuality(data: any): number {
        if (typeof data === 'string') {
            switch (data) {
                case 'HD':
                    this.defaultData.songDepth = 16
            } 
        }
        return data[0]
    }

    urlDecode(str: string): string {
        return encodeURIComponent(str)
    }

    updateMetadata(data: any): metadataType {
        if (data) {
            this.defaultData.songTitle = data['dc:title'][0]
            this.defaultData.artist = data['upnp:artist'][0]
            this.defaultData.albumUrl = data['upnp:albumArtURI'][0]
            this.defaultData.albumTitle = data['upnp:album'][0]
            this.defaultData.songFormat = data['song:format_s'][0]
            this.defaultData.songDepth = this.audioQuality(data['song:format_s'])
            this.defaultData.songQuality = data['song:actualQuality'][0]
            this.defaultData.songRate = data['song:rate_hz'][0] / 1000.0
            this.defaultData.songBitrate = data['song:bitrate'][0] / 1000.0
        }
        return this.defaultData
    }

    updateBiography(data: string) {
        this.detailsData.biography = data
        return this.detailsData
    }
}