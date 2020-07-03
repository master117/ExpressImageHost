/**
 * @author Johannes Gocke
 * A very simple express server that provides a rest interface for getting the name + path of all files in a certain directory
 * AND provides a static fileserver to access these files
 */

//////////////////
// Imports
//////////////////
// Directory/Path utility module
const path = require('path');
// HTTPS
const https = require('https');
// File access module
const fs = require("fs");
// Webserver
var express = require('express');

var cors = require('cors');

// Joining path of directory 
const directoryPath = path.join(__dirname, 'images');

/**
 * Gets all files in directory and subdirectories from given startpoint, all returned paths are relative
 * @param {string} dir directory to start searching at
 */
async function getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : path.relative(directoryPath, res);
    }));
    return Array.prototype.concat(...files);
}

// Creating webserver instance
var app = express();
app.use(cors())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// API GET paths to all images
app.get('/images', function (req, res) {
    // Get all files, async
    getFiles(directoryPath)
        // On Success
        .then(files => {
            // Add a / before each file name, replace \\ with /
            files = files.map(x => {
                return "/" + x.replace(/\\/g, "/");
            });

            // sending back result
            res.end(JSON.stringify(files));
        })
        // On Error
        .catch(e => console.error(e));
})

// Serving all files in the images directory
app.use(express.static('images'))

// Start Express Server
var server = https.createServer({
    key: fs.readFileSync('./gocke-photo.de-key.pem'),
    cert: fs.readFileSync('./gocke-photo.de-crt.pem')
}, app).listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Webserver is listening at https://%s:%s", host, port)
})

