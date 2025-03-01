const axios = require('axios');
const { accounts, getRandomUserAgent, proxyFile } = require('./config');
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
    am: '\x1b[38;5;198m',
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
╱╱╱╱╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱╱╱╭━╯┃
╱╱╱╱╱╱╱╱╱╱╱╰╯╱╱╱╱╱╱╱╱╱╱╰━━╯
\n${cl.gb}${cl.gr}blessnetwork Bot ${cl.rt}${cl.gb}v0.1.3${cl.rt}
        `);
        CoderMarkPrinted = true;
    }
}

const BASE_API_URL = "https://gateway-run.bls.dev";
const HEADERS_TEMPLATE = (authToken) => ({
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'access-control-allow-credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'sec-fetch-mode': 'cors',
    'user-agent': getRandomUserAgent()
});

async function pingSession(nodeId, headers, proxy) {
    const url = `${BASE_API_URL}/api/v1/nodes/${nodeId}/ping`;
    let agent;
    const config = {
        headers: headers,
        timeout: 30000 // 30 seconds timeout
    };

    if (proxy) {
        if (proxy.startsWith('socks://') || proxy.startsWith('socks5://')) {
            agent = new SocksProxyAgent(proxy);
        } else if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
            agent = new HttpsProxyAgent(proxy);
        }
        config.httpsAgent = agent;
    }

    const MAX_RETRIES = 5;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
        try {
            await axios.post(url, null, config);
            console.log(`${cl.yl})>${cl.or} Ping success ${cl.gr}-> ${cl.br}${nodeId}${cl.rt}`);
            return true;
        } catch (error) {
            // Handle response errors
            if (error.response) {
                const { status, data } = error.response;
                if (status === 403 && typeof data === 'string' && data.includes('Cloudflare protection detected')) {
                    retryCount++;
                    if (retryCount < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue;
                    } else {
                        return false;
                    }
                }
                if (status === 429) {
                    console.log(`${cl.yl})>${cl.rt} Rate limit reached ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}Too many requests${cl.rt}`);
                    await new Promise(resolve => setTimeout(resolve, 120000)); // Wait 2 minutes
                    return false;
                }
                if (status === 401 || status === 407) {
                    console.log(`${cl.yl})>${cl.rt} Authentication failed ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}Please check your AUTH_TOKEN${cl.rt}`);
                    process.exit(1);
                }
                if (status >= 500) {
                    console.log(`${cl.yl})>${cl.rt} Server error ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}${status}${cl.rt}`);
                    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
                    return false;
                }
                if (data) {
                    console.log(`${cl.yl})>${cl.rt} Error details: ${cl.red}${JSON.stringify(data)}${cl.rt}`);
                }
            } else if (error.request) {
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                } else {
                    return false;
                }
            } else {
                console.log(`${cl.yl})>${cl.rt} Unknown error ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}${error.message}${cl.rt}`);
            }
            return false;
        }
    }
    return false;
}

async function manageNode(nodeId, headers, proxy) {
    let consecutiveFailures = 0;
    const MAX_FAILURES = 5;

    try {
        while (true) {
            console.log(`${cl.yl})>${cl.rt} Pinging Node ${cl.gr}->${cl.br} ${nodeId}${cl.rt}`);
            const success = await pingSession(nodeId, headers, proxy);
            
            if (!success) {
                consecutiveFailures++;
                if (consecutiveFailures >= MAX_FAILURES) {
                    console.log(`${cl.red}Too many consecutive failures for Node ${nodeId}. Waiting 5 minutes before continuing...${cl.rt}`);
                    await new Promise(resolve => setTimeout(resolve, 300000)); // Wait 5 minutes
                    consecutiveFailures = 0;
                }
            } else {
                consecutiveFailures = 0;
            }

            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        }
    } catch (error) {
        console.log(`${cl.red}An error occurred for Node ${nodeId}: ${error}${cl.rt}`);
    }
}

async function readLines(filename) {
    try {
        const data = await fs.promises.readFile(filename, 'utf-8');
        console.log(`${cl.yl}[+]${cl.rt} Loaded data from ${filename}`);
        return data.split('\n').map(line => line.trim()).filter(line => line);
    } catch (error) {
        console.log(`${cl.red}Failed to read ${filename}: ${error.message}${cl.rt}`);
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
        console.log(`${cl.red}Unsupported proxy format: ${proxy}${cl.rt}`);
        return null;
    }

    try {
        const response = await axios.get('https://ipinfo.io/json', {
            httpsAgent: agent,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.log(`${cl.yl})>${cl.rt} Skipping proxy ${proxy} due to connection error: ${error.message}${cl.rt}`);
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

    try {
        const answer = await new Promise(resolve => {
            rl.question(`${cl.yl}Choose run option:\n\n${cl.rt}1. Run directly (without proxy)\n2. ${cl.gr}Run with proxy${cl.rt} (proxy.txt)\n\n Enter your choice: `, resolve);
        });

        if (answer === '2') {
            console.log(`\n${cl.yl})>${cl.gr} Proxy connection mode enabled.${cl.rt}`);
            console.log(`\n${cl.yl}[+]${cl.rt} Please wait...${cl.rt}\n`);
            
            const proxies = await readLines(proxyFile);
            if (proxies.length === 0) {
                console.log(`${cl.red}No proxies found. Exiting...${cl.rt}`);
                rl.close();
                return;
            }

            console.log(`${cl.yl}[+]${cl.rt} Loaded ${proxies.length} proxies`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded data from idnode.js`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded ${NODE_IDS.length} nodeIds\n`);

            const expectedProxies = accounts.length * 5;
            if (proxies.length < expectedProxies) {
                console.log(`${cl.red}Insufficient number of proxies. Required: ${expectedProxies}, Found: ${proxies.length}. Exiting...${cl.rt}`);
                rl.close();
                return;
            }

            const proxyGroups = [];
            for (let i = 0; i < accounts.length; i++) {
                proxyGroups.push(proxies.slice(i * 5, (i + 1) * 5));
            }

            const nodeGroups = [];
            for (let i = 0; i < accounts.length; i++) {
                nodeGroups.push(NODE_IDS.slice(i * 5, (i + 1) * 5));
            }

            const promises = [];
            for (let i = 0; i < accounts.length; i++) {
                const account = accounts[i];
                const accountProxies = proxyGroups[i];
                const accountNodes = nodeGroups[i];
                const authToken = account.AUTH_TOKEN;
                if (!authToken) {
                    console.log(`${cl.red}AUTH_TOKEN for Account ${i + 1} is missing. Skipping this account.${cl.rt}`);
                    continue;
                }
                const headers = HEADERS_TEMPLATE(authToken);

                for (let j = 0; j < accountNodes.length; j++) {
                    const nodeId = accountNodes[j];
                    const proxy = accountProxies[j];
                    const proxyInfo = await getProxyIP(proxy);
                    
                    if (proxyInfo) {
                        const maskedIp = proxyInfo.ip.replace(/(\\d+\\.\\d+\\.\\d+)\\.(\\d+)/, '$1.***');
                        console.log(`${cl.yl})>${cl.rt} Node ${cl.am}${nodeId}${cl.rt} using proxyIP: ${cl.gr}${maskedIp}${cl.rt}`);
                        promises.push(manageNode(nodeId, headers, proxy));
                    }
                }
            }
            
            await Promise.all(promises);
        } else {
            console.log(`\n${cl.yl})>${cl.gr} Direct connection mode enabled.${cl.rt}\n`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded data from idnode.js`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded ${NODE_IDS.length} nodeIds\n`);
            
            const promises = [];
            for (let i = 0; i < accounts.length; i++) {
                const account = accounts[i];
                const authToken = account.AUTH_TOKEN;
                if (!authToken) {
                    console.log(`${cl.red}AUTH_TOKEN for Account ${i + 1} is missing. Skipping this account.${cl.rt}`);
                    continue;
                }
                const headers = HEADERS_TEMPLATE(authToken);
                const accountNodes = NODE_IDS.slice(i * 5, (i + 1) * 5);
                for (const nodeId of accountNodes) {
                    promises.push(manageNode(nodeId, headers, null));
                }
            }
            await Promise.all(promises);
        }
    } catch (error) {
        console.log(`${cl.red}Error in main function: ${error}${cl.rt}`);
    } finally {
        rl.close();
    }
}

main().catch(error => console.log(`${cl.red}Unhandled error: ${error}${cl.rt}`));

process.on('SIGINT', () => {
    console.log("\nExiting script...");
    process.exit(0);
});

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.log(`${cl.red}Unhandled Rejection at:${cl.rt}`, promise, `${cl.red}reason:${cl.rt}`, reason);
});

process.on('uncaughtException', (error) => {
    console.log(`${cl.red}Uncaught Exception:${cl.rt}`, error);
    process.exit(1);
});
