const axios = require('axios');
const set = require('./config');
const { NODE_IDS } = require('./idnode');
const fs = require('fs');
const readline = require('readline');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

let CoderMarkPrinted = false;

const cl = {
    gr: '\x1b[32m',
    br: '\x1b[34m',
    red: '\x1b[31m',
    yl: '\x1b[33m',
    gb: '\x1b[4m',
    st: '\x1b[9m',
    or: '\x1b[35m',
    rt: '\x1b[0m'
};

function CoderMark() {
    if (!CoderMarkPrinted) {
        console.log(`
╭━━━╮╱╱╱╱╱╱╱╱╱╱╱╱╱╭━━━┳╮
┃╭━━╯╱╱╱╱╱╱╱╱╱╱╱╱╱┃╭━━┫┃${cl.gr}
┃╰━━┳╮╭┳━┳━━┳━━┳━╮┃╰━━┫┃╭╮╱╭┳━╮╭━╮
┃╭━━┫┃┃┃╭┫╭╮┃╭╮┃╭╮┫╭━━┫┃┃┃╱┃┃╭╮┫╭╮╮${cl.br}
┃┃╱╱┃╰╯┃┃┃╰╯┃╰╯┃┃┃┃┃╱╱┃╰┫╰━╯┃┃┃┃┃┃┃
╰╯╱╱╰━━┻╯╰━╮┣━━┻╯╰┻╯╱╱╰━┻━╮╭┻╯╰┻╯╰╯${cl.rt}
╱╱╱╱╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱╱╱╱╭━╯┃
╱╱╱╱╱╱╱╱╱╱╱╰╯╱╱╱╱╱╱╱╱╱╱╱╰━━╯
\n${cl.gb}${cl.gr}blessnetwork Bot ${cl.rt}${cl.gb}v0.1${cl.rt}
        `);
        CoderMarkPrinted = true;
    }
}

const BASE_API_URL = "https://gateway-run.bls.dev";
const AUTH_TOKEN = set.AUTH_TOKEN;
const HEADERS = {
    "Authorization": `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
};

const HealthHeader = {
    "Host": "gateway-run.bls.dev",
    "Accept": "*/*",
    "Origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
    "Accept-Language": "en-US,en;q=0.9"
}

async function checkGlobalHealth() {
    const url = `${BASE_API_URL}/health`;
    try {
        const response = await axios.get(url, { headers: HealthHeader });
        const healthStatus = response.data.status;
        console.log(`${cl.yl})>${cl.rt} Global Health Check: ${cl.gr}${healthStatus}${cl.rt}`);
    } catch (error) {
        console.log(`Global Health Check Failed: ${error.response.status} ${error.response.statusText}`);
        console.log(`Response content: ${error.response.data}`);
    }
}

async function pingSession(nodeId, proxy) {
    const url = `${BASE_API_URL}/api/v1/nodes/${nodeId}/ping`;
    let agent;

    if (proxy) {
        if (proxy.startsWith('socks://') || proxy.startsWith('socks5://')) {
            agent = new SocksProxyAgent(proxy);
        } else if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
            agent = new HttpsProxyAgent(proxy);
        }
    }

    try {
        await axios.post(url, null, { headers: HEADERS, httpsAgent: agent });
        console.log(`${cl.yl})>${cl.or} Ping success ${cl.gr}-> ${cl.br}${nodeId}${cl.rt}`);
    } catch (error) {
        console.log(`${cl.yl})>${cl.rt} Ping failed ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red} ${error.response.status} ${error.response.statusText}${cl.rt}`);
        console.log(`Response content: ${error.response.data}`);
    }
}

async function manageNode(nodeId, proxy) {
    try {
        while (true) {
            console.log(`${cl.yl})>${cl.rt} Pinging Node ${cl.gr}->${cl.br} ${nodeId}${cl.rt}`);
            await pingSession(nodeId, proxy);
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds between pings
        }
    } catch (error) {
        console.log(`${cl.red}An error occurred for Node ${nodeId}: ${error}${cl.rt}`);
    }
}

async function globalHealthMonitor() {
    try {
        while (true) {
            await checkGlobalHealth();
            await new Promise(resolve => setTimeout(resolve, 300000)); // Check global health every 5 minutes
        }
    } catch (error) {
        console.log(`${cl.red}An error occurred in global health monitoring: ${error}${cl.rt}`);
    }
}

async function readLines(filename) {
    try {
        const data = await fs.promises.readFile(filename, 'utf-8');
        console.log(`${cl.yl}[+]${cl.rt} Loaded data from ${filename}`);
        return data.split('\n').filter(Boolean);
    } catch (error) {
        console.log(`Failed to read ${filename}: ${error.message}`);
        return [];
    }
}

async function getProxyIP(proxy) {
    let agent;
    if (proxy.startsWith('socks://') || proxy.startsWith('socks5://')) {
        agent = new SocksProxyAgent(proxy);
    } else if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
        agent = new HttpsProxyAgent(proxy);
    } else {
        console.log(`Unsupported proxy format: ${proxy}`);
        return null;
    }

    try {
        const response = await axios.get('https://ipinfo.io/json', { httpsAgent: agent });
        const Ipinfo = response.data.ip;
        const maskedIp = Ipinfo.replace(/(\d+\.\d+\.\d+)\.(\d+)/, '$1.***');
        console.log(`${cl.yl})>${cl.rt} Connected through Ip: ${cl.gr}${cl.st} ${maskedIp}${cl.rt}`);
        return response.data;
    } catch (error) {
        console.log(`${cl.yl})>${cl.rt} Skipping proxy ${proxy} due to connection error: ${error.message}`);
        return null;
    }
}

async function main() {
    console.clear();
    CoderMark();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`${cl.yl}Choose run option:\n\n${cl.rt}1. Run directly (without proxy)\n2. ${cl.gr}Run with proxy${cl.rt} (proxy.txt)\n\n Enter your choice: `, async (answer) => {
        if (answer === '2') {
            console.log(`\n${cl.yl})>${cl.gr} Proxy connection mode enabled.${cl.rt}`);
            console.log(`\n${cl.yl}[+]${cl.yl} Please wait...${cl.rt}\n`);
            const proxies = await readLines(set.proxyFile);
            if (proxies.length === 0) {
                console.log('No proxies found. Exiting...');
                rl.close();
                return;
            }

            console.log(`${cl.yl}[+]${cl.rt} Loaded ${proxies.length} proxies`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded data from idnode.js`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded ${NODE_IDS.length} nodeId\n`);
            if (proxies.length < NODE_IDS.length) {
                console.log('Not enough proxies for the number of NODE_IDS. Exiting...');
                rl.close();
                return;
            } else if (proxies.length > NODE_IDS.length) {
                console.log('More proxies than NODE_IDS. Exiting...');
                rl.close();
                return;
            }

            for (let i = 0; i < NODE_IDS.length; i++) {
                const nodeId = NODE_IDS[i];
                const proxy = proxies[i];
                const proxyInfo = await getProxyIP(proxy);
                globalHealthMonitor();
                if (proxyInfo) {
                    manageNode(nodeId, proxyInfo.ip);
                }
            }
        } else {
            console.log(`\n${cl.yl})>${cl.gr} Direct connection mode enabled.${cl.rt}\n`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded data from idnode.js`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded ${NODE_IDS.length} nodeId\n`);
            const promises = [];

            promises.push(globalHealthMonitor());

            for (const nodeId of NODE_IDS) {
                promises.push(manageNode(nodeId, null));
            }

            await Promise.all(promises);
        }
        rl.close();
    });
}

main().catch(error => console.log(`Unhandled error: ${error}`));

process.on('SIGINT', () => {
    console.log("Exiting script...");
    process.exit(0);
});

