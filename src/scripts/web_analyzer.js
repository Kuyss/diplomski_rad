const fs = require("fs");
// Size of MAC (Message Authentification Code) in TLS encrypted data
const MAC_SIZE = 48;
const BUG_HR_IP_ADDR = "52.166.78.97";

const myArgs = process.argv.slice(2);
const mode = myArgs[0];

// Mode used to calculate returned resource size from har files
if (mode === "calc") {
  // Array used to store web link and returned resource size from server
  let pageSizeArr = [];

  // Iterate through all har files and calculate the resource size
  for (let i = 1; i <= 10; i++) {
    const webData = JSON.parse(fs.readFileSync(`../data/data${i}.har`));
    const filteredWebData = webData.log.entries.filter(e => e.serverIPAddress.startsWith(BUG_HR_IP_ADDR));
    const pageTitle = webData.log.pages[0].title;
    const webSize = filteredWebData.map(el => el.response._transferSize).reduce((acc, curr) => acc + curr);
    pageSizeArr.push({ pageTitle, webSize });
  }

  // Store resource size database in page_size_db.json file
  const jsonContent = JSON.stringify(pageSizeArr);
  fs.writeFile("../db/page_size_db.json", jsonContent, 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }
    console.log("JSON file has been saved in location '../db/page_size_db.json'.");
  });
}

// Mode used to compare captured data in wireshark with database created using "calc" mode
if (mode === "get") {
  // Iterate through the captured packets in json format and calculate most likely accessed web page
  for (let i = 1; i <= 10; i++) {
    const captureData = JSON.parse(fs.readFileSync(`../data/capture${i}.json`));
    const pageSizeArr = JSON.parse(fs.readFileSync(`../db/page_size_db.json`));
    const captureSize = captureData
                        .map(el => parseInt(el._source.layers.tls["tls.record"]["tls.record.length"]) - MAC_SIZE)
                        .reduce((acc, curr) => acc + curr);
  
    const sortedPageDiff = pageSizeArr.map(el => {
      return { pageTitle: el.pageTitle,  absDist: Math.abs(el.webSize - captureSize)}
    }).sort((a, b) => a.absDist - b.absDist);
  
    console.log( i + ". " + sortedPageDiff[0].pageTitle);
  }
}



