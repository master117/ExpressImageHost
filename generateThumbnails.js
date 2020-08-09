// Directory/Path utility module
const path = require('path');
// File access module
const fs = require("fs");
// Image Resizer
const sharp = require('sharp');

// Joining path of source image directory 
const sourceDirectoryPath = path.join(__dirname, 'images');
// Joining path of target image directory 
const targetDirectoryPath = path.join(__dirname, 'thumbnails');

// Create target directory if it doesn't already exist
if(!fs.existsSync(targetDirectoryPath)) {
    fs.mkdirSync(targetDirectoryPath, { recursive: true });
}

/**
 * Gets all files in directory and subdirectories from given startpoint, all returned paths are relative
 * @param {string} dir directory to start searching at
 */
async function getFiles(dir, rootDir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res, rootDir) : path.relative(rootDir, res);
    }));
    return Array.prototype.concat(...files);
}

// Get all already generated thumbnails, async
getFiles(targetDirectoryPath, targetDirectoryPath)
    // On Success
    .then(targetFiles => {
        // Add a / before each file name, replace \\ with /
        targetFiles = targetFiles.map(x => {
            return "/" + x.replace(/\\/g, "/");
        });

        // Get all source files that thumbnails should be made of, async
        getFiles(sourceDirectoryPath, sourceDirectoryPath)
            // On Success
            .then(sourceFiles => {
                // Add a / before each file name, replace \\ with /
                sourceFiles = sourceFiles.map(x => {
                    return "/" + x.replace(/\\/g, "/");
                });

                sourceFiles.reverse().forEach(sourceFile => {
                    if(!targetFiles.includes(sourceFile)) {
                        console.log("Found new file to convert: " + sourceFile);

                        var sourcePath = "images" + sourceFile;
                        var targetPath = "thumbnails" + sourceFile;

                        // Create target directory if it doesn't already exist
                        if(!fs.existsSync(path.dirname(targetPath))) {
                            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                        }

                        console.log("Transforming: " + sourcePath + " to: " + targetPath);
                        // Read image into sharp
                        sharp(sourcePath)
                            .resize({ width: 100, height: 100, fit: "inside" })
                            //Output file
                            .toFile(targetPath);
                    }
                });
            })
            // On Error
            .catch(e => console.error(e));
    })
    // On Error
    .catch(e => console.error(e));