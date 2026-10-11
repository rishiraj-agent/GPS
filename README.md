# GPS Tool — Geo & Phone Summary

A privacy-focused Python CLI tool for Kali Linux and WSL 2.

## Terminal Interface

```text
██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔════╝
██║  ███╗██████╔╝███████╗
██║   ██║██╔═══╝ ╚════██║
╚██████╔╝██║     ███████║
 ╚═════╝ ╚═╝     ╚══════╝

         GPS TOOL
    GEO & PHONE SUMMARY

[*] Platform : Kali Linux
[*] Mode     : Privacy-first analysis
[*] Version  : 1.0.0

[PHONE NUMBER ANALYSIS]
----------------------------------------
Number               : +91XXXXXXXXXX
Country Calling Code : +91
Possible Number      : Yes
Valid Number         : Yes / No
Region Code          : IN
General Area         : available
Carrier Metadata     : available
Subscriber Name      : available
Live GPS Location    : Permission required

[GOOGLE MAPS]
----------------------------------------
General Area Search  : available
Device GPS           : Available after permission

[*] Privacy: authorized tracking
[*] Status : Analysis completed
```

## Features

- Phone number validation and formatting
- Country calling code and region metadata
- Available general-area and carrier information
- Google Maps search integration
- Permission-based GPS access for your own device
- Kali Linux and WSL 2 compatibility
- Privacy-focused terminal interface

## Installation

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip

git clone https://github.com/rishiraj-agent/GPS.git
cd GPS

python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements.txt
```

Run the application using the entry point included in the repository. For example:

```bash
./gps --help
```

If the project uses a Python entry point instead, run the corresponding file documented in the repository.

## Privacy Notice

GPS does not identify a private subscriber or determine someone's exact live location from a phone number. Live GPS access requires the current device user's permission. Missing metadata is displayed as unavailable rather than invented.

## Developer

GitHub: https://github.com/rishiraj-agent/GPS
