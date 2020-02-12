const fs = require("fs");
// Path to captured TCP SYN packets in JSON format
const TCP_SYN_PATH = "../data/tcp_syn.json";

const packets = JSON.parse(fs.readFileSync(TCP_SYN_PATH));

// Variable used to store TTL and window size of all unique TCP SYN packets
let ttlWindowSizeArr = [];

for (let i = 0; i < packets.length; i++) {
  const packet = packets[i];
  // Store TTL and window size in obj
  const obj = {
    ttl: parseInt(packet._source.layers.ip["ip.ttl"]) + 1,
    windowSize: parseInt(packet._source.layers.tcp["tcp.window_size"])
  }
  // Check if TTL and window size combination is in the variable
  let isUnique = true;
  for (let j = 0; j < ttlWindowSizeArr.length; j++) {
    const ttlWindowSize = ttlWindowSizeArr[j];
    if (obj.ttl === ttlWindowSize.ttl && obj.windowSize === ttlWindowSize.windowSize) {
      isUnique = false;
      break;
    }
  }
  // If the TTL and window size are unique, store it in the array
  if (isUnique) {
    ttlWindowSizeArr.push(obj);
  }
}

// Save results in tcp_syn_arr.json file
const jsonContent = JSON.stringify(ttlWindowSizeArr);
fs.writeFile("../db/tcp_syn_db.json", jsonContent, 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }
  console.log("JSON file has been saved in '../db/tcp_syn_db.json' location.");
});


