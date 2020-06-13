# ExpressImageHost
A fast and easy to set up image host for your website, no config, no database

### Installation

1. Pull or download
2. run "npm install" or "yarn install" (no quotes) depending on your flavor. 
2. Create a folder "images" (no quotes) next to the index.js
3. Put all your images into images, you can use subdirectories

### Run

1. run "node index.js"
2. Access localhost:8081/images to get an array of all images currently in the image folder
3. Access images at localhost:8081/<ImageNameAndPath>

### Configuration

You can replace the port by replacing 8081 in index.js (line 53)

You can replace the directory by replacing "images" in index.js (line 37)
