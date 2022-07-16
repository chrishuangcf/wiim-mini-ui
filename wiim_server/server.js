const http = require('http');
const express = require("express");
const xml2js = require('xml2js');
const Client = require('upnp-device-client');

const app = express();
const WIIM_MINI_URL = '10.0.4.46' // '10.0.4.49' (bedroom)
const WIIM_MINI_PATRH = 'description.xml'
const WIIM_MINI_PORT = 49152

const xml = ''
let returnMetaData = {}

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
client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err, result) {
    if (err) throw err;
    const metaData = result.CurrentURIMetaData

    const metaReq = xml2js.parseString(metaData, (err, metadataJson) => {
        if (err) {
            throw err;
        }
        // const items = xmltodict.parse(meta)["DIDL-Lite"]["item"]
        console.log(JSON.stringify(metadataJson['DIDL-Lite']['item'][0], null, 4))
        returnMetaData = metadataJson['DIDL-Lite']['item'][0]
    });
    // console.log('CHRIS_AVT', returnMetaData);
});

// client.subscribe('AVTransport', function(e) {
//     // Will receive events like { InstanceID: 0, TransportState: 'PLAYING' } when playing media
//     console.log(e);
// });

// client.unsubscribe('AVTransport', listener);

app.use(express.static('public'));
app.get("/data", (req, res, next) => {

    client.callAction('AVTransport', 'GetMediaInfo', { InstanceID: 0 }, function(err, result) {
        if (err) throw err;
        const metaData = result.CurrentURIMetaData

        const metaReq = xml2js.parseString(metaData, (err, metadataJson) => {
            if (err) {
                throw err;
            }
            // const items = xmltodict.parse(meta)["DIDL-Lite"]["item"]
            console.log(JSON.stringify(metadataJson['DIDL-Lite']['item'][0], null, 4))
            returnMetaData = metadataJson['DIDL-Lite']['item'][0]
        });
        // console.log('CHRIS_AVT', returnMetaData);
    });

    res.send(returnMetaData)
        // process.stdout.write(d);
})

var server = app.listen(8080, function() {
    var port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});