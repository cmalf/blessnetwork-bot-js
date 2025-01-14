const axios = require('axios');
const set = require('./config');
const {
    NODE_IDS
} = require('./idnode');
const fs = require('fs');
const readline = require('readline');
const {
    SocksProxyAgent
} = require('socks-proxy-agent');
const {
    HttpsProxyAgent
} = require('https-proxy-agent');

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
╱╱╱╱╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱╱╱╱╭━╯┃
╱╱╱╱╱╱╱╱╱╱╱╰╯╱╱╱╱╱╱╱╱╱╱╱╰━━╯
\n${cl.gb}${cl.gr}blessnetwork Bot ${cl.rt}${cl.gb}v0.1.2${cl.rt}
        `);
        CoderMarkPrinted = true;
    }
}

const BASE_API_URL = "https://gateway-run.bls.dev";
const AUTH_TOKEN = set.AUTH_TOKEN;
const HEADERS = {
    "Authorization": `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": set.UserAgent
};

const HealthHeader = {
    "Host": "gateway-run.bls.dev",
    "Accept": "*/*",
    "Origin": "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
    "Accept-Language": "en-US,en;q=0.9"
};

async function checkGlobalHealth() {
    const url = `${BASE_API_URL}/health`;
    try {
        const response = await axios.get(url, {
            headers: HealthHeader,
            timeout: 10000 // Add timeout of 10 seconds
        });
        const healthStatus = response.data.status;
        console.log(`${cl.yl})>${cl.rt} Global Health Check: ${cl.gr}${healthStatus}${cl.rt}`);
        return healthStatus;
    } catch (error) {
        console.log(`${cl.red}Global Health Check Failed: ${error.message}${cl.rt}`);
        if (error.response) {
            console.log(`${cl.red}Response status: ${error.response.status}${cl.rt}`);
            console.log(`${cl.red}Response content: ${JSON.stringify(error.response.data)}${cl.rt}`);
        }
        return 'error';
    }
}

async function pingSession(nodeId, proxy) {
    const url = `${BASE_API_URL}/api/v1/nodes/${nodeId}/ping`;
    let agent;
    const config = {
        headers: HEADERS,
        timeout: 30000 // Add timeout of 30 seconds
    };

    if (proxy) {
        if (proxy.startsWith('socks://') || proxy.startsWith('socks5://')) {
            agent = new SocksProxyAgent(proxy);
        } else if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
            agent = new HttpsProxyAgent(proxy);
        }
        config.httpsAgent = agent;
    }

    try {
        await axios.post(url, null, config);
        console.log(`${cl.yl})>${cl.or} Ping success ${cl.gr}-> ${cl.br}${nodeId}${cl.rt}`);
        return true;
    } catch (error) {
        if (error.response) {
            // Handle Cloudflare or other specific errors
            if (error.response.status === 403 && error.response.data.includes('Cloudflare')) {
                console.log(`${cl.yl})>${cl.rt} Ping failed ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}Cloudflare protection detected${cl.rt}`);
                await new Promise(resolve => setTimeout(resolve, 300000));
                return false;
            }
            // Handle rate limiting
            if (error.response.status === 429) {
                console.log(`${cl.yl})>${cl.rt} Rate limit reached ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}Too many requests${cl.rt}`);
                await new Promise(resolve => setTimeout(resolve, 120000));
                return false;
            }
            // Handle authentication errors
            if (error.response.status === 401 || error.response.status === 403) {
                console.log(`${cl.yl})>${cl.rt} Authentication failed ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}Please check your AUTH_TOKEN${cl.rt}`);
                process.exit(1);
            }
            // Handle server errors
            if (error.response.status >= 500) {
                console.log(`${cl.yl})>${cl.rt} Server error ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}${error.response.status}${cl.rt}`);
                await new Promise(resolve => setTimeout(resolve, 60000));
                return false;
            }
            // Log other errors with response
            console.log(`${cl.yl})>${cl.rt} Ping failed ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}${error.response.status}${cl.rt}`);
            if (error.response.data) {
                console.log(`${cl.yl})>${cl.rt} Error details: ${cl.red}${JSON.stringify(error.response.data)}${cl.rt}`);
            }
        } else if (error.request) {
            // Handle network errors
            console.log(`${cl.yl})>${cl.rt} Network error ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}No response received${cl.rt}`);
            await new Promise(resolve => setTimeout(resolve, 30000));
        } else {
            // Handle other errors
            console.log(`${cl.yl})>${cl.rt} Unknown error ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red}${error.message}${cl.rt}`);
        }
        return false;
    }
}

async function manageNode(nodeId, proxy) {
    let consecutiveFailures = 0;
    const MAX_FAILURES = 5;

    try {
        while (true) {
            console.log(`${cl.yl})>${cl.rt} Pinging Node ${cl.gr}->${cl.br} ${nodeId}${cl.rt}`);
            const success = await pingSession(nodeId, proxy);
            
            if (!success) {
                consecutiveFailures++;
                if (consecutiveFailures >= MAX_FAILURES) {
                    console.log(`${cl.red}Too many consecutive failures for Node ${nodeId}. Waiting 5 minutes before continuing...${cl.rt}`);
                    await new Promise(resolve => setTimeout(resolve, 300000));
                    consecutiveFailures = 0;
                }
            } else {
                consecutiveFailures = 0;
            }

            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    } catch (error) {
        console.log(`${cl.red}An error occurred for Node ${nodeId}: ${error}${cl.rt}`);
    }
}

// Update globalHealthMonitor function to accept proxy parameter
async function globalHealthMonitor(proxy) {
    let consecutiveFailures = 0;
    const MAX_FAILURES = 3;

    try {
        while (true) {
            let config = {
                headers: HealthHeader,
                timeout: 10000
            };

            if (proxy) {
                let agent;
                if (proxy.startsWith('socks://') || proxy.startsWith('socks5://')) {
                    agent = new SocksProxyAgent(proxy);
                } else if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
                    agent = new HttpsProxyAgent(proxy);
                }
                config.httpsAgent = agent;
            }

            const url = `${BASE_API_URL}/health`;
            try {
                const response = await axios.get(url, config);
                const healthStatus = response.data.status;
                console.log(`${cl.yl})>${cl.rt} Global Health Check: ${cl.gr}${healthStatus}${cl.rt}`);
                consecutiveFailures = 0;
            } catch (error) {
                console.log(`${cl.red}Global Health Check Failed: ${error.message}${cl.rt}`);
                if (error.response) {
                    console.log(`${cl.red}Response status: ${error.response.status}${cl.rt}`);
                    console.log(`${cl.red}Response content: ${JSON.stringify(error.response.data)}${cl.rt}`);
                }
                consecutiveFailures++;
                if (consecutiveFailures >= MAX_FAILURES) {
                    console.log(`${cl.red}Global health check failed ${MAX_FAILURES} times in a row. Waiting 10 minutes...${cl.rt}`);
                    await new Promise(resolve => setTimeout(resolve, 600000));
                    consecutiveFailures = 0;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 300000));
        }
    } catch (error) {
        console.log(`${cl.red}An error occurred in global health monitoring: ${error}${cl.rt}`);
    }
}

async function readLines(filename) {
    try {
        const data = await fs.promises.readFile(filename, 'utf-8');
        console.log(`${cl.yl}[+]${cl.rt} Loaded data from ${filename}`);
        return data.split('\n').filter(line => line.trim());
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
        const maskedIp = response.data.ip.replace(/(\d+\.\d+\.\d+)\.(\d+)/, '$1.***');
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

    try {
        const answer = await new Promise(resolve => {
            rl.question(`${cl.yl}Choose run option:\n\n${cl.rt}1. Run directly (without proxy)\n2. ${cl.gr}Run with proxy${cl.rt} (proxy.txt)\n\n Enter your choice: `, resolve);
        });

        if (answer === '2') {
            console.log(`\n${cl.yl})>${cl.gr} Proxy connection mode enabled.${cl.rt}`);
            console.log(`\n${cl.yl}[+]${cl.yl} Please wait...${cl.rt}\n`);
            
            const proxies = await readLines(set.proxyFile);
            if (proxies.length === 0) {
                console.log(`${cl.red}No proxies found. Exiting...${cl.rt}`);
                rl.close();
                return;
            }

            console.log(`${cl.yl}[+]${cl.rt} Loaded ${proxies.length} proxies`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded data from idnode.js`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded ${NODE_IDS.length} nodeId\n`);

            if (proxies.length !== NODE_IDS.length) {
                console.log(`${cl.red}Number of proxies (${proxies.length}) does not match number of NODE_IDS (${NODE_IDS.length}). Exiting...${cl.rt}`);
                rl.close();
                return;
            }
    
            const promises = [];
            for (let i = 0; i < NODE_IDS.length; i++) {
                const nodeId = NODE_IDS[i];
                const proxy = proxies[i];
                const proxyInfo = await getProxyIP(proxy);
                
                // Start a health monitor for each NODE_IDS through proxy
                promises.push(globalHealthMonitor(proxy));
                
                if (proxyInfo) {
                    const maskedIp = proxyInfo.ip.replace(/(\d+\.\d+\.\d+)\.(\d+)/, '$1.***');
                    console.log(`${cl.yl})>${cl.rt} Node ${cl.am}${nodeId} ${cl.rt}using proxyIP: ${cl.gr}${maskedIp}${cl.rt}`);
                    // fix connection through proxy.
                    promises.push(manageNode(nodeId, proxy));
                }
            }
            
            await Promise.all(promises);
        } else {
            console.log(`\n${cl.yl})>${cl.gr} Direct connection mode enabled.${cl.rt}\n`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded data from idnode.js`);
            console.log(`${cl.yl}[+]${cl.rt} Loaded ${NODE_IDS.length} nodeId\n`);
            
            const promises = [globalHealthMonitor()];
            NODE_IDS.forEach(nodeId => promises.push(manageNode(nodeId, null)));
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

// Add these error handlers at the end
process.on('unhandledRejection', (reason, promise) => {
    console.log(`${cl.red}Unhandled Rejection at:${cl.rt}`, promise, `${cl.red}reason:${cl.rt}`, reason);
});

process.on('uncaughtException', (error) => {
    console.log(`${cl.red}Uncaught Exception:${cl.rt}`, error);
    process.exit(1);
});
