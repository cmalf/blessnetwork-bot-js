#!/usr/bin/env ruby

=begin
########################################################
#                                                      #
#  CODE  : Bless Network Bot v1.0.1(Exstension v0.1.8) #
#  PHP   : ruby 3.1.3p185 (2022-11-24 rev 1a6b16756e)  #
#  Author: CMALF (Docosa Jagocuan Group)               #
#  TG    : https://t.me/Djagocuan                      #
#  DC    : Docosa Jagocuan Group                       #
#                                                      #
########################################################

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
=end

require 'yaml'
require 'uri'
require 'json'
require 'securerandom'
require 'faker'
require 'colorize'
require 'digest'
require 'curb'
require 'ostruct'

# ---------------- CoderMark_CMALF ----------------

def codermark_cmalf
  begin
    lines = []
    lines << " ______     __    __     ______     __         ______  "
    lines << ("/\\  ___\\   /\\ \"-./  \\   /\\  __ \\   /\\ \\       /\\  ___\\").colorize(:green)
    lines << "\\ \\ \\____  \\ \\ \\-./\\ \\  \\ \\  __ \\  \\ \\ \\____  \\ \\  __\\"
    lines << (" \\ \\_____\\  \\ \\_\\ \\ \\_\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\").colorize(:blue)
    lines << ("  \\/_____/   \\/_/  \\/_/   \\/_/\\/_/   \\/_____/   \\/_/").colorize(:blue)
    lines << ""
    lines << "[+] ".colorize(:yellow) + "Bless Network Bot " + "{ ".colorize(:blue) + "Ruby🍷".colorize(:red) + " }".colorize(:blue)
    lines << ""
    lines << "[+] DM : ".colorize(:yellow) + "https://t.me/Djagocuan".colorize(:cyan)
    lines << "[+] GH : ".colorize(:yellow) + "https://github.com/cmalf/".colorize(:cyan)
    lines << ("―" * 55).colorize(:green)
    lines << "[->] ".colorize(:yellow) + "{ ".colorize(:blue) + "Bless Extension ".colorize(:default) + "v0.1.8".colorize(:magenta) + " }".colorize(:blue)
    lines << "[->] ".colorize(:yellow) + "{ ".colorize(:blue) + "Bot Version ".colorize(:default) + "v1.0.1".colorize(:magenta) + " }".colorize(:blue)
    lines << ("―" * 55).colorize(:green)
    puts lines.join("\n")
  rescue => error
    puts "An error occurred while logging the banner: #{error}"
  end
end

# ---------------- Utility ----------------

def mask_node_id(node_id)
  return node_id if node_id.to_s.length <= 10
  "#{node_id[0,5]}:::#{node_id[-5,5]}"
end

def parse_proxy(proxy_str)
  uri = URI.parse(proxy_str.strip)
  {
    scheme: uri.scheme,
    host: uri.host,
    port: uri.port,
    user: uri.user,
    pass: uri.password
  }
rescue URI::InvalidURIError => e
  puts "Invalid proxy URL: #{proxy_str} (#{e.message})".colorize(:red)
  nil
end

def generate_hash
  random_data = SecureRandom.random_bytes(32)
  Digest::SHA512.hexdigest(random_data)
end

def random_hardware_id
  SecureRandom.hex(32)
end

def random_cpu_architecture
  %w[x86_64 arm64 mips powerpc].sample
end

def random_cpu_model(architecture)
  models = {
    "x86_64" => [
      "Intel(R) Core(TM) i5-8500T CPU @ 2.10GHz",
      "Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz",
      "AMD Ryzen 5 3600",
      "Intel(R) Xeon(R) Gold 6230 CPU @ 2.10GHz",
      "AMD Ryzen 9 5950X",
      "Intel(R) Core(TM) i9-12900K",
      "AMD EPYC 7763",
      "Intel(R) Celeron(R) N4020",
      "AMD Athlon 3000G",
      "Intel(R) Pentium(R) Gold G6400",
      "AMD Ryzen Threadripper 3990X",
      "Intel(R) Core(TM) i3-10100",
      "AMD Ryzen 7 5800X3D",
      "Intel(R) Xeon(R) Platinum 8280",
      "AMD Ryzen 3 3200G"
    ],
    "arm64" => [
      "ARM Cortex-A72",
      "Apple M1",
      "Qualcomm Kryo 585",
      "Apple M2",
      "ARM Cortex-A55",
      "Qualcomm Snapdragon 8 Gen 1",
      "NVIDIA Carmel CPU",
      "Samsung Exynos 2100",
      "MediaTek Dimensity 9000",
      "Amazon Graviton2",
      "ARM Cortex-A78",
      "Apple M1 Pro",
      "Qualcomm Snapdragon 8cx Gen 3",
      "Google Tensor G2",
      "ARM Cortex-X2"
    ],
    "mips" => [
      "MIPS 24Kc",
      "MIPS R4000",
      "MIPS 34Kc",
      "MIPS 74Kc",
      "MIPS I6400",
      "MIPS P5600",
      "MIPS Warrior P-class P5600",
      "MIPS 32 4KEc",
      "MIPS 64 5KEc",
      "MIPS 32 24KEc",
      "MIPS 64 74KEc",
      "MIPS 32 4KEc",
      "MIPS 64 5KEc",
      "MIPS 32 24KEc",
      "MIPS 64 74KEc"
    ],
    "powerpc" => [
      "IBM POWER8",
      "IBM POWER9",
      "IBM POWER10",
      "Freescale PowerQUICC III",
      "IBM POWER7",
      "IBM POWER6",
      "IBM POWER5",
      "Freescale e5500",
      "Freescale e6500",
      "IBM RS64",
      "IBM 750CXe",
      "IBM 970MP",
      "IBM 970GX",
      "IBM 440GX",
      "IBM 405GP"
    ]
  }
  models[architecture].sample
end

def random_cpu_features
  features_pool = %w[mmx sse sse2 sse3 ssse3 sse4_1 sse4_2 avx]
  num_features = rand(1..features_pool.size)
  features_pool.shuffle.take(num_features).sort
end

def random_num_of_processors
  rand(2..16)
end

def random_total_memory
  possible_memories = [8, 16, 32, 64]
  gb = possible_memories.sample
  gb * 1024**3
end

def send_request(method, url, headers = {}, body = nil, proxy = nil)
  begin
    curl = Curl::Easy.new(url)
    curl.headers = headers
    curl.follow_location = true

    if proxy
      proxy_url = "#{proxy[:scheme]}://"
      if proxy[:user] && !proxy[:user].to_s.empty?
        proxy_url += "#{proxy[:user]}:#{proxy[:pass]}@"
      end
      proxy_url += "#{proxy[:host]}:#{proxy[:port]}"
      curl.proxy_url = proxy_url
    end

    method = method.upcase
    case method
    when "GET"
      curl.http_get
    when "POST"
      curl.http_post(body.to_s)
    when "PUT"
      curl.http_put(body.to_s)
    else
      curl.http_get
    end

    response = OpenStruct.new
    response.code = curl.response_code
    response.body = curl.body_str
    response
  rescue Curl::Err::CurlError => e
    puts "Error during request to #{url}: #{e.message}".colorize(:red)
    nil
  end
end

def send_request_with_retry(method, url, headers = {}, body = nil, proxy = nil, max_retries = 3)
  attempts = 0
  response = nil
  begin
    while attempts < max_retries
      response = send_request(method, url, headers, body, proxy)
      if response && response.code.to_i == 403
        attempts += 1
        puts "Received 403. Retrying (attempt #{attempts})...".colorize(:yellow)
        sleep 1
      else
        break
      end
    end
  rescue => e
    puts "Exception during request: #{e.message}".colorize(:red)
  end
  response
end

def fetch_public_ip(proxy)
  url = "https://api.ipify.org"
  response = send_request("GET", url, {}, nil, proxy)
  if response && response.code.to_i.between?(200, 299)
    response.body.strip
  else
    "0.0.0.0"
  end
end

def generate_headers(auth_token, user_agent, extension_sig)
  {
    "accept" => "*/*",
    "accept-language" => "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6,zh;q=0.5",
    "authorization" => "Bearer #{auth_token}",
    "content-type" => "application/json",
    "origin" => "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
    "priority" => "u=1, i",
    "sec-fetch-dest" => "empty",
    "sec-fetch-mode" => "cors",
    "sec-fetch-site" => "cross-site",
    "user-agent" => user_agent,
    "x-extension-signature" => extension_sig,
    "x-extension-version" => "0.1.8"
  }
end

# ---------------- Process for Each Node ----------------

def process_node(account_token, node_id, proxy, proxy_ip)
  masked_id = mask_node_id(node_id)
  extension_signature = generate_hash
  user_agent = Faker::Internet.user_agent

  ip_address = proxy_ip
  hardware_id = random_hardware_id
  cpu_arch = random_cpu_architecture
  cpu_model = random_cpu_model(cpu_arch)
  cpu_features = random_cpu_features
  num_processors = random_num_of_processors
  total_memory = random_total_memory

  hardware_info = {
    "cpuArchitecture" => cpu_arch,
    "cpuModel" => cpu_model,
    "cpuFeatures" => cpu_features,
    "numOfProcessors" => num_processors,
    "totalMemory" => total_memory
  }

  headers = generate_headers(account_token, user_agent, extension_signature)

  node_url = "https://gateway-run.bls.dev/api/v1/nodes/#{node_id}"
  body1 = {
    ipAddress: ip_address,
    hardwareId: hardware_id,
    hardwareInfo: hardware_info,
    extensionVersion: "0.1.8"
  }
  str_t = "]> ".colorize(:light_yellow)
  str_ni = "[#{masked_id.light_blue}] " + "Sending node info..."
  puts str_t + str_ni
  res1 = send_request_with_retry("POST", node_url, headers, JSON.generate(body1), proxy)
  res1_code = res1 ? res1.code.to_s : "No Response"
  str_rni = "[#{masked_id.light_blue}] " + "Response for node info: ".light_magenta + res1_code.light_green
  puts str_t + str_rni

  ping_url = "#{node_url}/ping"
  body_ping = { isB7SConnected: false }
  str_inp = "[#{masked_id.light_blue}] " + "Sending initial ping..."
  puts str_t + str_inp
  res2 = send_request_with_retry("POST", ping_url, headers, JSON.generate(body_ping), proxy)
  res2_code = res2 ? res2.code.to_s : "No Response"
  str_rinp = "[#{masked_id.light_blue}] " + "Response for ping: ".light_magenta + res2_code.light_green
  puts str_t + str_rinp

  health_url = "https://gateway-run.bls.dev/health"
  health_headers = headers.dup
  health_headers.delete("authorization")
  health_headers.delete("x-extension-signature")
  health_headers.delete("x-extension-version")
  str_hl = "[#{masked_id.light_blue}] " + "Checking health..."
  puts str_t + str_hl
  res3 = send_request_with_retry("GET", health_url, health_headers, nil, proxy)
  res3_code = res3 ? res3.code.to_s : "No Response"
  str_rhl = "[#{masked_id.light_blue}] " + "Response for health: ".light_magenta + res3_code.light_green
  puts str_t + str_rhl
rescue StandardError => e
  puts "[#{masked_id.light_blue}] " + "Error in process: " + e.message.to_s.red
end

# ---------------- Graceful Shutdown Setup ----------------

$shutdown = false
Signal.trap("INT") do
  puts "\nSIGINT received. Initiating graceful shutdown..."
  $shutdown = true
end

# ---------------- Configuration Loading ----------------

def load_configuration
  begin
    config = YAML.load_file('config.yaml')
  rescue Errno::ENOENT
    puts "config.yaml file not found.".colorize(:red)
    exit 1
  end

  accounts = config['accounts'] || []
  if accounts.empty?
    puts "No accounts found in config.yaml".colorize(:red)
    exit 1
  end
  accounts
end

def load_proxies
  unless File.exist?('proxy.txt')
    puts "proxy.txt file not found.".colorize(:red)
    exit 1
  end

  proxy_lines = File.readlines('proxy.txt').map(&:strip).reject { |line| line.empty? }
  proxies = proxy_lines.map { |line| parse_proxy(line) }.compact
  if proxies.empty?
    puts "No valid proxies found in proxy.txt".colorize(:red)
    exit 1
  end
  proxies
end

# ---------------- Execution ----------------

codermark_cmalf

begin
  loop do
    break if $shutdown
    accounts = load_configuration
    proxies = load_proxies
    proxy_index = 0

    accounts.each do |account|
      break if $shutdown
      auth_token = account['authToken']
      node_ids = account['nodeIds'] || []
      node_ids.each do |node_id|
        break if $shutdown
        assigned_proxy = proxies[proxy_index % proxies.size]
        proxy_index += 1
        proxy_ip = fetch_public_ip(assigned_proxy)
        masked_id = mask_node_id(node_id)
        str_t = "]> ".colorize(:light_yellow)
        str_ip = "[#{masked_id.light_blue}] " + "Using ProxyIP: " + proxy_ip.light_blue
        puts str_t + str_ip

        process_node(auth_token, node_id, assigned_proxy, proxy_ip)
        sleep 5
      end
    end
    str_t = "]> ".colorize(:light_yellow)
    str_c = "All accounts processed. Waiting for 10 minutes For Next Cycle...".colorize(:cyan)
    puts str_t + str_c
    600.times do
      sleep 1
      break if $shutdown
    end
  end
  puts "Graceful shutdown complete. Exiting now."
rescue Interrupt
  puts "Interrupt received. Exiting now."
end
