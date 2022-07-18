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
let authorData = ''

// url: 'http://10.0.4.49:49152/description.xml' (bedroom)
var client = new Client(`http://${WIIM_MINI_URL}:${WIIM_MINI_PORT}/${WIIM_MINI_PATRH}`)

// Get the device description
client.getDeviceDescription(function(err, description) {
    if (err) throw err;
    console.log(description);
});

// Get the device's AVTransport service description
client.getServiceDescription('AVTransport', function(err, description) {
    if (err) throw err;
    // console.log('CHRIS_DESC', description);
});

// Call GetMediaInfo on the AVTransport service
// client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err, result) {
//     if (err) throw err;
//     const metaData = result.CurrentURIMetaData

//     const metaReq = xml2js.parseString(metaData, (err, metadataJson) => {
//         if (err) {
//             throw err;
//         }
//         returnMetaData = metadataJson['DIDL-Lite']['item'][0]
//     });
// });

// client.subscribe('AVTransport', function(e) {
//     // Will receive events like { InstanceID: 0, TransportState: 'PLAYING' } when playing media
//     console.log(e);
// });

// client.unsubscribe('AVTransport', listener);

app.use(express.static(__dirname + '/public'))
    // app.get("/", (req, res) => {
    //     res.sendFile(`${__dirname}/public/index.html`)
    // })
app.get("/data", (req, res, next) => {

    client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err, result) {
        if (err) throw err;
        const metaData = result.CurrentURIMetaData

        const metaReq = xml2js.parseString(metaData, (err, metadataJson) => {
            if (err) {
                throw err;
            }
            returnMetaData = metadataJson['DIDL-Lite']['item'][0]
        });
    });
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
        // console.log(`statusCode: ${res.statusCode}`)
        let data = ''

        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            const regxWhiteSpaces = /^\s+|\s+$|\s+(?=\s)/g
            const subst = ''
            const $ = cheerio.load(data)
            artistData = $('.wiki-content').text().replace(regxWhiteSpaces, subst)
            res.json({ "biography": artistData })
        })
    });

    request.on('error', error => {
        console.error(error)
    });

    request.end()
        // res.send(author)

    //   const options = {
    //     url: 'https://en.wikipedia.org/wiki/Main_Page',
    //     transform: function (html) {
    //         return cheerio.load(html);
    //     }
    // };

    // rp(options)
    // .then(($) => {
    //     console.log($('#mp-portals').text());
    // })
    // .catch(function(err){
    //     console.log(err);
    // });

    // res.end(JSON.stringify(response));
})

var server = app.listen(8080, function() {
    console.log("Server started at http://localhost:%s%s", server.address().address, server.address().port)
});