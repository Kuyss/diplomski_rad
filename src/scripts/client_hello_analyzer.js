const pcapp = require('pcap-parser');
const fs = require("fs");
// Path to pcap file with filtered TLS client hello messages only
const TLS_CLIENT_HELLO_PATH = "../data/tls_clientHello.pcap";
// Path to cipher suite list and corresponding web browser
const CIPHER_SUITE_DB_PATH = "../db/cipher_suite_db.json";

const parser = pcapp.parse(TLS_CLIENT_HELLO_PATH);
const cipherSuiteDb = JSON.parse(fs.readFileSync(CIPHER_SUITE_DB_PATH));

// Offset in bytes from start of packet to session_id field in TLS client hello message
const SESSION_ID_OFFSET = 97;

// Object used to store number of connections for each browser
let browserObj = { unknown: 0 };

// Parse every packet
parser.on('packetData', function (packet) {
  // Determine length of session_id 
  const sessionIdLenHex = packet.toString("hex", SESSION_ID_OFFSET, SESSION_ID_OFFSET + 1);
  const sessionIdLen = parseInt(Number(`0x${sessionIdLenHex}`, 10));

  // Determine cipher suite list in hexadecimal string format for the web browser
  const cipherSuiteOffset = 98 + sessionIdLen;
  const cipherSuiteHexLen = packet.toString("hex", cipherSuiteOffset, cipherSuiteOffset + 2);
  const cipherSuiteLen = parseInt(Number(`0x${cipherSuiteHexLen}`, 10));
  const cipherSuiteHexList = packet.toString("hex", cipherSuiteOffset + 2, cipherSuiteOffset + 2 + cipherSuiteLen);

  //Find the cipher suite list corresponding to any web browser 
  const browserSuites = cipherSuiteDb.find(el => el.cipherSuites === cipherSuiteHexList);

  if (browserSuites) { // If cipher suite list was in the database
    const browser = browserSuites.browser;
    if (!browserObj.hasOwnProperty(browser)) {
      browserObj[browser] = 1;
    } else {
      browserObj[browser]++;
    }
  } else { // If cipher suite list was not in the database
    browserObj.unknown++;
  }
});

// Log the result with number of connections for each browser
parser.on('end', function () {
  console.log(browserObj);
})
