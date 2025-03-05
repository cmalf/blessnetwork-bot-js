<?php
/**
########################################################
#                                                      #
#   CODE  : Bless Network Bot v0.1.4(Exstension v0.1.7)#
#   PHP   : PHP 8.4.3 (cli) Zend Engine v4.4.3         #
#   Author: Danesh Gautav (Docosa Jagocuan Group)      #
#   TG    : https://t.me/Edwinbagas7                   #
#   DC    : Docosa Jagocuan Group                      #
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

require_once 'config.php';
require_once 'idnode.php';

// Check if cURL extension is installed
if (!extension_loaded('curl')) {
    $installInstructions = "Error: PHP cURL extension is not installed.\n\n";
    $installInstructions .= "Installation instructions:\n\n";
    $installInstructions .= "For Windows:\n";
    $installInstructions .= "1. Open php.ini file\n";
    $installInstructions .= "2. Uncomment extension=curl\n";
    $installInstructions .= "3. Restart your web server\n\n";
    $installInstructions .= "For Linux (Ubuntu/Debian):\n";
    $installInstructions .= "sudo apt-get install php-curl\n";
    $installInstructions .= "sudo service apache2 restart\n\n";
    $installInstructions .= "For macOS:\n";
    $installInstructions .= "1. Using Homebrew: brew install php@8.x\n";
    $installInstructions .= "2. Or modify php.ini to enable curl extension\n";
    die($cl['red'] . $installInstructions . $cl['rt']);
}

$Colors = [
    "Gold"    => "\x1b[38;5;220m",
    "Red"     => "\x1b[31m",
    "Teal"    => "\x1b[38;5;51m",
    "Green"   => "\x1b[32m",
    "Neon"    => "\x1b[38;5;198m",
    "Blue"    => "\x1b[34m",
    "Magenta" => "\x1b[95m",
    "Dim"     => "\x1b[2m",
    "Rt"      => "\x1b[0m"
];

function CoderMark() {
  global $Colors;
  echo " " . $Colors['Gold'] . "
█████████████████████████████████████" . $Colors['Magenta'] . "
█▄─▄▄▀██▀▄─██▄─▀█▄─▄█▄─▄▄─█─▄▄▄▄█─█─█
██─██─██─▀─███─█▄▀─███─▄█▀█▄▄▄▄─█─▄─█" . $Colors['Gold'] . "
▀▄▄▄▄▀▀▄▄▀▄▄▀▄▄▄▀▀▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▄▀▄▀
" . $Colors['Blue'] . "{" . $Colors['Neon'] . "Gautav" . $Colors['Blue'] . "}" . $Colors['Rt'] . "
\n" . $Colors['Rt'] . "Bless Network Bot " . $Colors['Blue'] . "{ " . $Colors['Neon'] . "PHP" . $Colors['Blue'] . " }" . $Colors['Rt'] . "
    \n" . $Colors['Rt'] . str_repeat('―', 50) . "
    \n" . $Colors['Gold'] . "[+]" . $Colors['Rt'] . " DM : " . $Colors['Teal'] . "https://t.me/Edwinbagas7
    \n" . $Colors['Gold'] . "[+]" . $Colors['Rt'] . " DC : " . $Colors['Teal'] . "Docosa Jagocuan Group
    \n" . $Colors['Rt'] . str_repeat('―', 50) . "
    \n" . $Colors['Gold'] . "]-> " . $Colors['Blue'] . "{ " . $Colors['Rt'] . "BLESS Extension" . $Colors['Neon'] . " v0.1.7" . $Colors['Blue'] . " } " . $Colors['Rt'] . "
    \n" . $Colors['Gold'] . "]-> " . $Colors['Blue'] . "{ " . $Colors['Rt'] . "BOT" . $Colors['Neon'] . " v0.1.4" . $Colors['Blue'] . " } " . $Colors['Rt'] . "
    \n" . $Colors['Rt'] . str_repeat('―', 50) . "
    ";
}

function maskedNodeId($nodeId) {
    if (!is_string($nodeId) || strlen($nodeId) <= 8) {
        return $nodeId;
    }
    return substr($nodeId, 0, 4) . ':::' . substr($nodeId, -4);
}

class ProxyError extends Exception {
    public $proxy;
    public function __construct($message, $proxy) {
        parent::__construct($message);
        $this->proxy = $proxy;
    }
}

function loadProxies() {
    global $proxyFile;
    try {
        $content = file_get_contents($proxyFile);
        $lines = explode("\n", $content);
        $proxies = [];
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (strlen($trimmed) > 0) {
                $proxies[] = $trimmed;
            }
        }
        return $proxies;
    } catch (Exception $error) {
        error_log('Error loading proxies: ' . $error->getMessage());
        return [];
    }
}

function parseProxyURL($proxyUrl) {
    try {
        $urlParts = parse_url($proxyUrl);
        if ($urlParts === false) {
            throw new Exception("Unable to parse URL");
        }
        $proxyConfig = [
            "host" => isset($urlParts["host"]) ? $urlParts["host"] : "",
            "port" => isset($urlParts["port"]) ? intval($urlParts["port"]) : 0
        ];
        if (isset($urlParts["user"])) {
            $proxyConfig["username"] = $urlParts["user"];
        }
        if (isset($urlParts["pass"])) {
            $proxyConfig["password"] = $urlParts["pass"];
        }
        return $proxyConfig;
    } catch (Exception $error) {
        error_log("Failed to parse proxy URL: " . $error->getMessage());
        return null;
    }
}

function HEADERS($authToken) {
    return [
        'accept: */*',
        'accept-language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6,zh;q=0.5',
        'Authorization: Bearer ' . $authToken,
        'Content-Type: application/json',
        'user-agent: ' . getRandomUserAgent()
    ];
}

function HEADERSIP() {
    return [
        'user-agent: ' . getRandomUserAgent()
    ];
}

function curlRequest($url, $method, $headers, $payload = null, $proxyConfig = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($method === 'POST' && $payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    }
    if (!is_null($proxyConfig)) {
        curl_setopt($ch, CURLOPT_PROXY, $proxyConfig["host"]);
        curl_setopt($ch, CURLOPT_PROXYPORT, $proxyConfig["port"]);
        if (isset($proxyConfig["username"]) && isset($proxyConfig["password"])) {
            curl_setopt($ch, CURLOPT_PROXYUSERPWD, $proxyConfig["username"] . ':' . $proxyConfig["password"]);
        }
    }
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $responseBody = curl_exec($ch);
    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if(curl_errno($ch)) {
        $error_msg = curl_error($ch);
        curl_close($ch);
        throw new Exception("CURL error: " . $error_msg);
    }
    curl_close($ch);
    return [
        "status" => $httpStatus,
        "body" => $responseBody
    ];
}

function processNode($authToken, $nodeId, $proxy, $globalNodeIndex) {
    global $Colors;
    try {
        $proxyConfig = null;
        if ($proxy) {
            $proxyConfig = parseProxyURL($proxy);
        }
        
        if ($proxy) {
            try {
                $ipInfoResponse = curlRequest('https://ipinfo.io/json', 'GET', HEADERSIP(), null, $proxyConfig);
                if ($ipInfoResponse["status"] < 200 || $ipInfoResponse["status"] >= 300) {
                    throw new Exception("HTTP error! status: " . $ipInfoResponse["status"]);
                }
                $data = json_decode($ipInfoResponse["body"], true);
                if (!isset($data["ip"])) {
                    throw new Exception("IP not found in response.");
                }
                $maskedIp = preg_replace("/(\\d+\\.\\d+\\.\\d+)\\.(\\d+)/", "$1.:::", $data["ip"]);
                echo $Colors["Neon"] . "]> " . $Colors["Rt"] . " Using proxy for node " . $Colors["Teal"] . maskedNodeId($nodeId) . $Colors["Rt"] . " from line " . ($globalNodeIndex + 1) . ": " . $Colors["Rt"] . "IP: " . $Colors["Gold"] . $maskedIp . $Colors["Rt"] . "\n";
            } catch (Exception $ipError) {
                echo $Colors["Red"] . "Failed to fetch/mask proxy IP for node " . maskedNodeId($nodeId) . ":" . $Colors["Rt"] . "\n";
                throw $ipError;
            }
        } else {
            echo $Colors["Red"] . "No proxy found for node " . maskedNodeId($nodeId) . ". Proceeding without a proxy." . $Colors["Rt"] . "\n";
        }
        
        $postUrl = "https://gateway-run.bls.dev/api/v1/nodes/" . $nodeId . "/ping";
        $getUrl  = "https://gateway-run.bls.dev/api/v1/nodes/" . $nodeId;
        $payload = json_encode(["isB7SConnected" => false]);

        echo $Colors["Neon"] . "]> " . $Colors["Rt"] . " Node : " . $Colors["Teal"] . " " . maskedNodeId($nodeId) . $Colors["Rt"] . "\n";
        
        // POST request: ping the node.
        $postResponse = curlRequest($postUrl, 'POST', HEADERS($authToken), $payload, $proxyConfig);
        $pingColor = ($postResponse["status"] === 200) ? $Colors["Green"] : $Colors["Red"];
        $statusPing = ($postResponse["status"] === 200) ? "Pinging Success!" : "Pinging Failed!";
        echo $Colors["Neon"] . "]> " . $Colors["Rt"] . " PING : " . $pingColor . " " . $statusPing . $Colors["Rt"] . "\n";
        
        // GET request: check node status.
        $getResponse = curlRequest($getUrl, 'GET', HEADERS($authToken), null, $proxyConfig);
        $getColor = ($getResponse["status"] === 200) ? $Colors["Gold"] : $Colors["Red"];
        $statusCheck = ($getResponse["status"] === 200) ? "Checking Success!" : "Checking Failed!";
        echo $Colors["Neon"] . "]> " . $Colors["Rt"] . " Check: " . $getColor . " " . $statusCheck . $Colors["Rt"] . "\n";
        
        $totalReward = 'N/A';
        $todayReward = 'N/A';
        try {
            $responseData = json_decode($getResponse["body"], true);
            if (isset($responseData["totalReward"])) {
                $totalReward = $responseData["totalReward"];
            }
            if (isset($responseData["todayReward"])) {
                $todayReward = $responseData["todayReward"];
            }
        } catch (Exception $parseError) {
            echo $Colors["Red"] . "Error parsing GET response body for node " . maskedNodeId($nodeId) . ":" . $Colors["Rt"] . "\n";
        }
        
        echo $Colors["Neon"] . "]> " . $Colors["Rt"] . " Point: " . $Colors["Rt"] . " totalReward: " . $Colors["Neon"] . " " . $totalReward . " " . $Colors["Rt"] . " todayReward: " . $Colors["Neon"] . " " . $todayReward . $Colors["Rt"] . "\n";
        
    } catch (Exception $error) {
        echo $Colors["Red"] . "Error processing node " . maskedNodeId($nodeId) . ":" . $Colors["Rt"] . "\n";
        throw $error;
    }
}

function processNodeWithRetries($authToken, $nodeId, $proxy, $globalNodeIndex, $maxRetries = 3) {
    global $Colors;
    $attempt = 0;
    while ($attempt < $maxRetries) {
        try {
            processNode($authToken, $nodeId, $proxy, $globalNodeIndex);
            return;
        } catch (Exception $error) {
            $attempt++;
            echo $Colors["Red"] . "Attempt " . $attempt . " failed for node " . maskedNodeId($nodeId) . "." . $Colors["Rt"] . "\n";
            if ($attempt >= $maxRetries) {
                echo $Colors["Red"] . "Max retries reached for node " . maskedNodeId($nodeId) . ". Skipping..." . $Colors["Rt"] . "\n";
            } else {
                echo $Colors["Neon"] . "]> " . $Colors["Rt"] . "Retrying node " . maskedNodeId($nodeId) . " (Attempt " . ($attempt + 1) . " of " . $maxRetries . ")..." . "\n";
            }
        }
    }
}

function main() {
    global $accounts, $NODE_IDS, $Colors;
    $proxies = loadProxies();

    if (count($NODE_IDS) < count($accounts) * 5) {
        echo "Not enough node IDs for the number of accounts.\n";
        return;
    }

    for ($accIndex = 0; $accIndex < count($accounts); $accIndex++) {
        $account = $accounts[$accIndex];
        $authToken = $account["AUTH_TOKEN"];
        echo $Colors["Gold"] . "Processing account " . ($accIndex + 1) . "..." . $Colors["Rt"] . "\n";
        
        for ($nodeIndex = 0; $nodeIndex < 5; $nodeIndex++) {
            $globalNodeIndex = $accIndex * 5 + $nodeIndex;
            if (!isset($NODE_IDS[$globalNodeIndex])) {
                echo $Colors["Red"] . "No node ID found for account " . ($accIndex + 1) . ", node " . ($nodeIndex + 1) . ". Skipping." . $Colors["Rt"] . "\n";
                continue;
            }
            $nodeId = $NODE_IDS[$globalNodeIndex];
            $proxyLine = isset($proxies[$globalNodeIndex]) ? $proxies[$globalNodeIndex] : null;
            processNodeWithRetries($authToken, $nodeId, $proxyLine, $globalNodeIndex);
        }
    }
}


function runPeriodically() {
    global $Colors;
    while (true) {
        try {
            main();
        } catch (Exception $error) {
            echo $Colors["Red"] . "Error in main process:" . $Colors["Rt"] . " " . $error->getMessage() . "\n";
        }
        echo "\n" . $Colors["Neon"] . "]> " . $Colors["Gold"] . " Wait 10 Minutes for Next PING Cycle..." . $Colors["Rt"] . "\n";
        sleep(600); // Pause for 10 minutes (600 seconds)
    }
}


if (php_sapi_name() === "cli") {
    if (strncasecmp(PHP_OS, 'WIN', 3) == 0) {
        system('cls');
    } else {
        system('clear');
    }
}
CoderMark();
runPeriodically();
?>
