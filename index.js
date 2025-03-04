"use strict";
/**
########################################################
#                                                      #
#   CODE  : Bless Network Bot v0.1.4(Exstension v0.1.7)#
#   NodeJs: v23.6.1                                    #
#   Author: Furqonflynn (cmalf)                        #
#   TG    : https://t.me/furqonflynn                   #
#   GH    : https://github.com/cmalf                   #
#                                                      #
########################################################
*/
/**
 * This code is open-source and welcomes contributions! 
 * 
 * If you'd like to add features or improve this code, please follow these steps:
 * 1. Fork this repository to your own GitHub account.
 * 2. Make your changes in your forked repository.
 * 3. Submit a pull request to the original repository. 
 * 
 * This allows me to review your contributions and ensure the codebase maintains high quality. 
 * 
 * Let's work together to improve this project!
 * 
 * P.S. Remember to always respect the original author's work and avoid plagiarism. 
 * Let's build a community of ethical and collaborative developers.
 */

const fs = require('fs');
const { URL } = require('url');
const { connect } = require("puppeteer-real-browser");
//const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { accounts, getRandomUserAgent, proxyFile } = require('./config');
const { NODE_IDS } = require('./idnode');

const Colors = {
  Gold: "\x1b[38;5;220m",
  Red: "\x1b[31m",
  Teal: "\x1b[38;5;51m",
  Green: "\x1b[32m",
  Neon: "\x1b[38;5;198m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[95m",
  Dim: "\x1b[2m",
  Rt: "\x1b[0m"
};

function CoderMark() {
  console.log(`
╭━━━╮╱╱╱╱╱╱╱╱╱╱╱╱╱╭━━━┳╮
┃╭━━╯╱╱╱╱╱╱╱╱╱╱╱╱╱┃╭━━┫┃${Colors.Green}
┃╰━━┳╮╭┳━┳━━┳━━┳━╮┃╰━━┫┃╭╮╱╭┳━╮╭━╮
┃╭━━┫┃┃┃╭┫╭╮┃╭╮┃╭╮┫╭━━┫┃┃┃╱┃┃╭╮┫╭╮╮${Colors.Blue}
┃┃╱╱┃╰╯┃┃┃╰╯┃╰╯┃┃┃┃┃╱╱┃╰┫╰━╯┃┃┃┃┃┃┃
╰╯╱╱╰━━┻╯╰━╯┣━━┻╯╰┻╯╱╱╰━┻━╮╭┻╯╰┻╯╰╯${Colors.Rt}
╱╱╱╱╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱╱╱╭━╯┃${Colors.Blue}{${Colors.Neon}cmalf${Colors.Blue}}${Colors.Rt}
╱╱╱╱╱╱╱╱╱╱╱╰╯╱╱╱╱╱╱╱╱╱╱╰━━╯
\n${Colors.Rt}Bless Network Bot ${Colors.Blue}{ ${Colors.Neon}JS${Colors.Blue} }${Colors.Rt}
    \n${Colors.Green}${'―'.repeat(50)}
    \n${Colors.Gold}[+]${Colors.Rt} DM : ${Colors.Teal}https://t.me/furqonflynn
    \n${Colors.Gold}[+]${Colors.Rt} GH : ${Colors.Teal}https://github.com/cmalf/
    \n${Colors.Green}${'―'.repeat(50)}
    \n${Colors.Gold}]-> ${Colors.Blue}{ ${Colors.Rt}BLESS Extension${Colors.Neon} v0.1.7${Colors.Blue} } ${Colors.Rt}
    \n${Colors.Gold}]-> ${Colors.Blue}{ ${Colors.Rt}BOT${Colors.Neon} v0.1.4${Colors.Blue} } ${Colors.Rt}
    \n${Colors.Green}${'―'.repeat(50)}
    `);
}

function maskedNodeId(nodeId) {
  if (typeof nodeId !== 'string') return nodeId;
  if (nodeId.length <= 8) return nodeId;
  return nodeId.slice(0, 4) + ':::' + nodeId.slice(-4);
}

class ProxyError extends Error {
  constructor(message, proxy) {
    super(message);
    this.name = "ProxyError";
    this.proxy = proxy;
  }
}

function loadProxies() {
  try {
    const content = fs.readFileSync(proxyFile, 'utf8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  } catch (error) {
    console.error('Error loading proxies:', error.message);
    return [];
  }
}

function parseProxyURL(proxyUrl) {
  try {
    const urlObj = new URL(proxyUrl);
    const proxyConfig = {
      host: urlObj.hostname,
      port: parseInt(urlObj.port, 10)
    };
    if (urlObj.username) {
      proxyConfig.username = urlObj.username;
    }
    if (urlObj.password) {
      proxyConfig.password = urlObj.password;
    }
    return proxyConfig;
  } catch (error) {
    console.error("Failed to parse proxy URL:", error.message);
    return null;
  }
}

const HEADERS = (authToken) => ({
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json',
  'user-agent': getRandomUserAgent()
});

async function processNode(authToken, nodeId, proxy, globalNodeIndex) {
  let browser;
  let page;
  try {

    let proxyConfig = null;
    if (proxy) {
      proxyConfig = parseProxyURL(proxy);
    }
    
    const connection = await connect({
      headless: false,
      args: ["--window-size=240,320"],
      customConfig: {},
      turnstile: false,
      fingerprint: true,
      connectOption: {},
      disableXvfb: false,
      ignoreAllFlags: false,
      proxy: proxyConfig,
      //plugins: [require("puppeteer-extra-plugin-stealth")()], // Not Working For Headless Still detected as bot
    });
    browser = connection.browser;
    page = connection.page;

    if (proxy) {
      try {
        const maskedIp = await page.evaluate(async () => {
          const response = await fetch('https://ipinfo.io/json');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return data.ip.replace(/(\d+\.\d+\.\d+)\.(\d+)/, '$1.:::');
        });
        console.log(`${Colors.Neon}]> ${Colors.Rt} Using proxy for node ${Colors.Teal}${maskedNodeId(nodeId)}${Colors.Rt} from line ${globalNodeIndex + 1}: ${Colors.Rt}IP: ${Colors.Gold}${maskedIp}${Colors.Rt}`);
      } catch (ipError) {
        console.error(`${Colors.Red}Failed to fetch/mask proxy IP for node ${maskedNodeId(nodeId)}:${Colors.Rt}`);
        throw ipError;
      }
    } else {
      console.warn(`${Colors.Red}No proxy found for node ${maskedNodeId(nodeId)}. Proceeding without a proxy.${Colors.Rt}`);
    }

    const postUrl = `https://gateway-run.bls.dev/api/v1/nodes/${nodeId}/ping`;
    const getUrl = `https://gateway-run.bls.dev/api/v1/nodes/${nodeId}`;
    const payload = { "isB7SConnected": false };

    console.log(`${Colors.Neon}]> ${Colors.Rt} Node : ${Colors.Teal} ${maskedNodeId(nodeId)}${Colors.Rt}`);

    const postResponse = await page.evaluate(async (url, headers, payload) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
      return {
        status: response.status,
        body: await response.text()
      };
    }, postUrl, HEADERS(authToken), payload);

    const pingColor = postResponse.status === 200 ? Colors.Green : Colors.Red;
    const statusPing = postResponse.status === 200 ? "Pinging Success!" : "Pinging Failed!";
    console.log(`${Colors.Neon}]> ${Colors.Rt} PING : ${pingColor} ${statusPing}${Colors.Rt}`);

    const getResponse = await page.evaluate(async (url, headers) => {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      return {
        status: response.status,
        body: await response.text()
      };
    }, getUrl, HEADERS(authToken));

    const getColor = getResponse.status === 200 ? Colors.Gold : Colors.Red;
    const statusCheck = getResponse.status === 200 ? "Checking Success!" : "Checking Failed!";
    console.log(`${Colors.Neon}]> ${Colors.Rt} Check: ${getColor} ${statusCheck}${Colors.Rt}`);

    let totalReward = 'N/A';
    let todayReward = 'N/A';
    try {
      const responseData = JSON.parse(getResponse.body);
      totalReward = responseData.totalReward !== undefined ? responseData.totalReward : totalReward;
      todayReward = responseData.todayReward !== undefined ? responseData.todayReward : todayReward;
    } catch (parseError) {
      console.error(`${Colors.Red}Error parsing GET response body for node ${maskedNodeId(nodeId)}:${Colors.Rt}`);
    }
    
    console.log(`${Colors.Neon}]> ${Colors.Rt} Point: ${Colors.Rt} totalReward: ${Colors.Neon} ${totalReward} ${Colors.Rt} todayReward: ${Colors.Neon} ${todayReward}${Colors.Rt}`);

  } catch (error) {
    console.error(`${Colors.Red}Error processing node ${maskedNodeId(nodeId)}:${Colors.Rt}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function processNodeWithRetries(authToken, nodeId, proxy, globalNodeIndex, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await processNode(authToken, nodeId, proxy, globalNodeIndex);
      return;
    } catch (error) {
      attempt++;
      console.error(`${Colors.Red}Attempt ${attempt} failed for node ${maskedNodeId(nodeId)}.${Colors.Rt}`);
      if (attempt >= maxRetries) {
        console.error(`${Colors.Red}Max retries reached for node ${maskedNodeId(nodeId)}. Skipping...${Colors.Rt}`);
      } else {
        console.log(`${Colors.Neon}]> ${Colors.Rt}Retrying node ${maskedNodeId(nodeId)} (Attempt ${attempt + 1} of ${maxRetries})...`);
      }
    }
  }
}

async function main() {
  const proxies = loadProxies();

  if (NODE_IDS.length < accounts.length * 5) {
    console.error("Not enough node IDs for the number of accounts.");
    return;
  }

  for (let accIndex = 0; accIndex < accounts.length; accIndex++) {
    const account = accounts[accIndex];
    const authToken = account.AUTH_TOKEN;
    console.log(`${Colors.Gold}Processing account ${accIndex + 1}...${Colors.Rt}`);

    // For each account, process 5 node IDs.
    for (let nodeIndex = 0; nodeIndex < 5; nodeIndex++) {
      const globalNodeIndex = accIndex * 5 + nodeIndex;
      const nodeId = NODE_IDS[globalNodeIndex];
      const proxy = proxies[globalNodeIndex] || null; // Get corresponding proxy line
      
      if (!nodeId) {
        console.warn(`${Colors.Red}No node ID found for account ${accIndex + 1}, node ${nodeIndex + 1}. Skipping.${Colors.Rt}`);
        continue;
      }
      
      await processNodeWithRetries(authToken, nodeId, proxy, globalNodeIndex);
    }
  }
}

// Run main immediately and then every 10 minutes (600,000 milliseconds)
async function runPeriodically() {
  try {
    await main();
  } catch (error) {
    console.error(`${Colors.Red}Error in main process:${Colors.Rt}`, error);
  }
  // Schedule the next run after 10 minutes.
  console.log(`\n${Colors.Neon}]> ${Colors.Gold} Wait 10 Minutes for Next PING Cycle...${Colors.Rt}`);
  setTimeout(runPeriodically, 10 * 60 * 1000);
}

console.clear();
CoderMark();
runPeriodically();
