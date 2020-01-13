const fs = require("fs");

const myArgs = process.argv.slice(2);
const mode = myArgs[0];

if (mode === "calc") {
  let pageSizeArr = [];

  for (let i = 1; i <= 5; i++) {
    const webData = JSON.parse(fs.readFileSync(`./data/data${i}.har`));
    

    const filteredWebData = webData.log.entries.filter(e => e.serverIPAddress.startsWith("52.166.78.97"));

    const pageTitle = webData.log.pages[0].title;

    const webSize = filteredWebData.map(el => el.response._transferSize).reduce((acc, curr) => acc + curr);

    

    pageSizeArr.push({ pageTitle, webSize });
  }

  var jsonContent = JSON.stringify(pageSizeArr);

  fs.writeFile("page_size_db.json", jsonContent, 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });
}

if (mode === "get") {
  const captureData = JSON.parse(fs.readFileSync(`./data/capture.json`));
  const pageSizeArr = JSON.parse(fs.readFileSync(`./page_size_db.json`));
  const captureSize = captureData.map(el => parseInt(el._source.layers.tls["tls.record"]["tls.record.length"]) - 48).reduce((acc, curr) => acc + curr);

  console.log(pageSizeArr.map(el => {
    return { pageTitle: el.pageTitle,  absDist: Math.abs(el.webSize - captureSize)}
  }).sort((a, b) => a.absDist - b.absDist)[0].pageTitle);
}



