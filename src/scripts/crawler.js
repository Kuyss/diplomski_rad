const rp = require('request-promise');
const $ = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const URL = 'https://www.bug.hr';

(async () => {
  const browser = await puppeteer.launch();
  const [page] = await browser.pages();

  const results = []; // collects all results

  let paused = false;
  let pausedRequests = [];

  const nextRequest = () => { // continue the next request or "unpause"
    if (pausedRequests.length === 0) {
      paused = false;
    } else {
      // continue first request in "queue"
      (pausedRequests.shift())(); // calls the request.continue function
    }
  };

  await page.setRequestInterception(true);
  page.on('request', request => {
    if (paused) {
      pausedRequests.push(() => request.continue());
    } else {
      paused = true; // pause, as we are processing a request now
      request.continue();
    }
  });

  page.on('requestfinished', async (request) => {
    const response = await request.response();

    const responseHeaders = response.headers();

    const information = {
      url: request.url(),
      responseHeaders: responseHeaders,
      responseSize: responseHeaders['content-length'],
    };
    results.push(information);

    nextRequest(); // continue with next request
  });
  page.on('requestfailed', (request) => {
    // handle failed request
    nextRequest();
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });
  console.log(results.map(el => parseInt(el.responseSize || 0) + 350).reduce((acc, curr) => acc + curr), results.length);
  const jsonContent = JSON.stringify(results);
  fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});
  await browser.close();
})();