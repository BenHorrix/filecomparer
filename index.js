const fs = require('fs'); 
const path = require("path");
const util = require("util");

const astat = util.promisify(fs.stat);
const areaddir = util.promisify(fs.readdir);

async function getFiles(dir) {
    // Get this directory's contents
    const files = await areaddir(dir);
    // Wait on all the files of the directory
    return Promise.all(files
      // Prepend the directory this file belongs to
      .map(f => path.join(dir, f))
      // Iterate the files and see if we need to recurse by type
      .map(async f => {
        // See what type of file this is
        const stats = await astat(f);
        // Recurse if it is a directory, otherwise return the filepath
        return stats.isDirectory() ? getFiles(f) : f;
      }));
  }
  

function getAllFilesInDirectories(directories) {
    return Promise.all(directories.map(async directory => {
        const files = await getFiles(directory);
        return { directory, files, fileCount: files.length }
    }))
}

getAllFilesInDirectories(process.argv.slice(2))
.then(filesAndDirectories => {
    console.log({filesAndDirectories});
});