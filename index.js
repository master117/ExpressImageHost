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
// File access module
const fs = require("fs");
// Webserver
const express = require('express');
// Cors
const cors = require('cors');
// Upload
const fileUpload = require('express-fileupload');

// Joining path of directory 
const directoryPath = path.join(__dirname, 'files');

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
app.get('/files', function (req, res) {
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

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }));

app.post('/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
    
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let sampleFile = req.files.uploadFile;
    
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(path.join(__dirname, 'files/' + req.files.uploadFile.name), function(err) {
        if (err)
          return res.status(500).send(err);
    
        res.send('File uploaded!');
      });
  });

// Serving all files in the images directory
app.use(express.static('images'))

// Serving all files in the thumbnails directory
app.use(express.static('thumbnails'))

// Start Express Server
var port = 8081;
app.listen(port, function () {
    console.log("Webserver is listening at %s", port);
})

