//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//passsing directoryPath and callback function
fs.readdir("D:/dev/capture", (err, files) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(file => {
        // Do whatever you want to do with the file
        console.log(file); 
    });
});