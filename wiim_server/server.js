const http = require('http')
const path = require('path')
const https = require('https')
const express = require("express")
const xml2js = require('xml2js')
const cheerio = require('cheerio')
const Client = require('upnp-device-client')
const bodyParser = require('body-parser')

const app = express()
const WIIM_MINI_URL = '10.0.4.46' // '10.0.4.49' (bedroom)
const WIIM_MINI_PATRH = 'description.xml'
const WIIM_MINI_PORT = process.env.port || 49152

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const xml = ''
let returnMetaData = {}
let playerStatus = 'Init'

// url: 'http://10.0.4.49:49152/description.xml' (bedroom)
var client = new Client(`http://${WIIM_MINI_URL}:${WIIM_MINI_PORT}/${WIIM_MINI_PATRH}`)

// Get the device description
client.getDeviceDescription((err, description) => {
    if (err) throw err;
    // console.log('DESCRIPTION')
    // console.log(description)
})

// client.unsubscribe('AVTransport', listener);

app.use(express.static(__dirname + '/public'))
    // app.get("/", (req, res) => {
    //     res.sendFile(`${__dirname}/public/index.html`)
    // })
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
app.get("/data", (req, res, next) => {
    client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err, result) {
        if (err) throw err;
        const metaData = result.CurrentURIMetaData

        const metaReq = xml2js.parseString(metaData, (err, metadataJson) => {
            if (err) {
                throw err;
            }
            returnMetaData = metadataJson['DIDL-Lite']['item'][0]
        })
    })
    res.send(returnMetaData)
})
app.post("/biography", (req, res) => {
    const { artist } = req.body

    const options = {
        hostname: 'www.last.fm',
        port: 443,
        path: `/music/${artist}/+wiki`,
        method: 'GET',
    }

    const request = https.request(options, resp => {
        let data = '',
            artistData = ''

        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
                const regxWhiteSpaces = /^\s+|\s+$|\s+(?=\s)/g
                const subst = ''
                const $ = cheerio.load(data)
                artistData = $('.wiki-content').text().replace(regxWhiteSpaces, subst)
                if (artistData.length > 0) {
                    res.json({ biography: artistData })
                } else {
                    res.json({ biography: 'no data' })
                }
            })
            // res.json({ "biography": artistData })
    });

    request.on('error', error => {
        console.error(error)
    });

    request.end()
})
app.post("/actions", (req, res) => {
    const { player } = req.body

    if (player === 'status') {
        client.callAction('AVTransport', 'GetTransportInfo', { InstanceID: 0 }, function(err, result) {
            if (err) throw err;
            playerStatus = { status: result.CurrentTransportState }
        })
    }
    if (['Play', 'Next', 'Prev', 'Pause'].includes(player)) {
        let options = { InstanceID: 0 }

        if (player === 'Play') options.Speed = 1

        client.callAction('AVTransport', player, options, function(err, result) {
            if (err) throw err;
        })
    }
    res.json(playerStatus)
})

var server = app.listen(8080, function() {
    console.log("Server started at http://localhost:%s%s", server.address().address, server.address().port)
});