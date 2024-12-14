# 🌐 blessnetwork-bot-js

A Node.js script to automate running blessnetwork node.

> [!WARNING]
> I am not responsible for any loss or damage caused by this bot. Use it at your own risk.

## 🦾 Script Features

- Direct Connection
- Connection through Proxy
- Running Multiple NodeID Devices (not multiple account)

## ᝰ.ᐟ Note 

- Update From Discord
- 5-node limit(max) per account

## 🔓 Register 

- If you don't have a bless account yet, SignUp Here [bless.network](https://bless.network/dashboard?ref=SFYQDB)
- Then Open `blessnework Dashboard` and `install` the extention.

## 🤔 How To Do
- Clone This Repo
  - ```bash
    git clone https://github.com/cmalf/blessnetwork-bot-js.git
    ```
- Go To Folder
  - ```bash
    cd blessnetwork-bot-js
    ```
- Install Dependencies
  - ```bash
    npm install
    ```
- Before run the script `configure first`

## ⚙️ Configuration

SetUp on `config.js` and `idnode.js`

- After Installing The Extention
- Right Click on The Extention and Choose `Inspect`
- ![Screenshot 2024-12-14 at 03 52 28](https://github.com/user-attachments/assets/7c2bc8e4-446a-473b-a4b7-ef42e95d6814)
- Then Go to `Console Tab`, and Paste the code below :

```bash
chrome.storage.local.get("nodeData", function(data) {
  console.log("Node Data:", data.nodeData);
});

chrome.storage.local.get("authToken", function(data) {
 console.log("Auth Token:", data.authToken);
 });
```
- see ss below :
- ![Screenshot 2024-12-14 at 03 53 30](https://github.com/user-attachments/assets/58dd17a5-0589-4988-a589-bd781b425480)

- Done.. All set.

## TO GET ANOTHER NODEID

- Delete the extentions
- Logout your Account
- Login To your account
- Go To Dashboard
- Then Install Extension again.
- Dont Forget To save All Peer Encrypted and Peer PubKey

## ᝰ.ᐟ For Using Proxy

- If you want to use Proxy on the script
  
   - Open `proxy.txt` to setup
   - Support Http and Socks Proxy
   - format proxies is: `socks://username:pass@ip:port` Or `http://username:pass@ip:port`
- Then...

## 🏃🏻‍♂️‍➡️ Run the Script

- To run the script
```bash
npm start
```

## [◉°] ScreenShoot

- Direct
- <img src="https://github.com/user-attachments/assets/8ab921fd-7cbe-4a5e-a96b-4502714a4f62" widht=580 height=480 >

- Connection through Proxy
- <img src="https://github.com/user-attachments/assets/c74c1489-e8b6-4cef-8104-55b7d126c86d" widht=580 height=480 >

- Monitoring On Dashboard
- <img src="https://github.com/user-attachments/assets/caa89af0-bbe9-4fbd-871b-4e565fad040b" widht=580 height=480 >



## 📢 Additional information

  To get a stable Proxy you can use this Platform, plans ranging from $3 to $125 for 6 months, or use your own choice.
  
- Get Proxies IP address Socks5
  - Create an account at [proxies.fo](https://app.proxies.fo/ref/8b1abd0f-c734-1602-5985-612caedf4c7b)
  - Go to `purchase isp`  and `buy` a plan according to `your needs`.
    - You can use `cryptocurrency` for `payment` 
    - <img src="https://github.com/user-attachments/assets/18f24ed1-cfc6-4141-addb-07e009c7226b" width="720" height="480" alt="Screenshot">
  - after that you go to the dashboard `Click Generate proxy Button`
  - Now You can change the Proxy format to :
     - `protocol://username:password@hostname:port`
     - or just look the ss below
     - ![Screenshot 2024-12-06 at 16 24 31](https://github.com/user-attachments/assets/c9d552f1-7241-4705-8580-30a88aae8638)

