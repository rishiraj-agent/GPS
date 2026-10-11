# GPS — Geo & Phone Summary

```
██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔════╝
██║  ███╗██████╔╝███████╗
██║   ██║██╔═══╝ ╚════██║
╚██████╔╝██║     ███████║
 ╚═════╝ ╚═╝     ╚══════╝

         GPS TOOL
   GEO & PHONE SUMMARY

[*] Platform: Kali Linux & WSL 2
[*] Mode: Privacy-first analysis
[*] Version: 1.0.0
```

**GPS (Geo & Phone Summary)** is a professional, privacy-first command-line utility for **Kali Linux** and **Kali Linux on WSL 2**. It analyzes international phone numbering plans, parses country calling codes, evaluates formatting compliance, generates general-area Google Maps queries, and provides a consent-based module for obtaining the current device user's own GPS coordinates.

---

## Key Principles & Privacy Design

1. **No Magic Tracking:** A phone number alone **NEVER** reveals an individual subscriber's real-time physical GPS coordinates.
2. **No Private Identity Harvesting:** Public numbering plans do not disclose private subscriber names, home addresses, or call records.
3. **Explicit Consent Geolocation:** The `my-location` command strictly queries the **current user's local device** through the browser Geolocation API with explicit interactive consent. No location data is sent to external or third-party servers.
4. **Transparent Metadata:** Clearly labels carrier and region assignments as numbering plan allocations, warning users about Mobile Number Portability (MNP) and inactive numbers.

---

## Features

- **Numbering Plan Validation:** Identifies if a number conforms to ITU-T E.164 and national telecommunication plans.
- **Multi-Format Formatting:** Generates International, National, and standardized E.164 strings.
- **Area & Carrier Intelligence:** Extracts geographic administrative regions and mobile/fixed carrier allocations using `phonenumbers`.
- **Google Maps Integration:** Produces standard Google Maps search URLs for geographic administrative regions and coordinate pairs.
- **Consent-Based Device GPS:** Opens an isolated localhost consent portal allowing the device operator to share their own coordinates.
- **Professional Kali CLI Aesthetic:** Dark cyber theme, ANSI color coding, structured output cards, graceful no-color fallback.

---

## Supported Operating Systems

- **Kali Linux** (2022.x, 2023.x, 2024.x+)
- **Kali Linux on Windows Subsystem for Linux (WSL 2)**
- **Debian GNU/Linux** (11/12+)
- **Ubuntu Linux** (20.04/22.04/24.04+)

---

## Prerequisites

- **Python 3.8+**
- Standard system tools (`bash`, `curl`, or `wget`)
- Modern web browser for the consent geolocation flow (Firefox, Chromium, Chrome, Brave, Edge)

---

## Installation

### Standard Kali Linux & WSL 2 Setup

```bash
# 1. Clone or extract the GPS archive
cd GPS/

# 2. Make the installer executable
chmod +x install.sh

# 3. Run the installer (unprivileged, no sudo required)
./install.sh

# 4. Reload shell profile
source ~/.bashrc

# 5. Verify installation
GPS --help
```

The installer configures an isolated virtual environment in `~/.local/share/gps-tool` and installs an executable launcher at `~/.local/bin/GPS`.

---

## Commands & Usage Examples

### 1. Startup Overview
Display the ASCII banner and quick reference guide:
```bash
GPS
```

### 2. Help Manual
Display all available command arguments and flags:
```bash
GPS --help
```

### 3. International Phone Number Lookup
Analyze an E.164 international phone number:
```bash
GPS lookup +919876543210
```

### 4. Domestic Phone Number with Default Region
Parse national numbers without country prefix by specifying `--region`:
```bash
# India domestic number
GPS lookup 9876543210 --region IN

# United States domestic number
GPS lookup 2025550123 --region US

# United Kingdom domestic number
GPS lookup 02079460192 --region GB
```

### 5. Open Google Maps Search Automatically
Pass `--open-browser` or `-o` to launch the general area search query immediately:
```bash
GPS lookup +12025550123 --open-browser
```

### 6. Consent-Based Device GPS
Retrieve the coordinates of your **own current device**:
```bash
GPS my-location
```
1. GPS launches a local HTTP listener at `http://127.0.0.1:8765`.
2. A local consent page opens in your default browser.
3. You review the explicit privacy notice and click **"Share My Device Location"**.
4. The browser prompts for location access.
5. Coordinates (latitude, longitude, and accuracy in metres) are returned to your terminal with an official Google Maps navigation link.

### 7. Version Inspection
```bash
GPS --version
```

---

## Example Output

```text
██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔════╝
██║  ███╗██████╔╝███████╗
██║   ██║██╔═══╝ ╚════██║
╚██████╔╝██║     ███████║
 ╚═════╝ ╚═╝     ╚══════╝

         GPS TOOL
   GEO & PHONE SUMMARY

[*] Platform: Kali Linux / WSL 2
[*] Mode: Privacy-first analysis
[*] Version: 1.0.0
----------------------------------------------------

[*] Analyzing phone number input: +919876543210

[PHONE NUMBER ANALYSIS]
Number                : +919876543210
Country Calling Code  : +91
Region Code           : IN
Possible Number       : Yes
Valid Number          : Yes
International Format  : +91 98765 43210
National Format       : 098765 43210
E.164 Format          : +919876543210
General Area          : India
Carrier Metadata      : Airtel
Time Zones            : Asia/Calcutta
City                  : Not available (A city must not be guessed from a phone number)
Name                  : Not available (Subscriber identity is private & not exposed in numbering plans)
Live Location         : Not available (Carrier numbering metadata only; exact GPS cannot be derived from a phone number alone)

[GOOGLE MAPS]
Search General Area   : https://www.google.com/maps/search/?api=1&query=India

----------------------------------------------------
[!] Carrier information may be outdated, particularly after mobile number portability (MNP). A valid numbering plan does not prove that a number is active or belongs to a particular person.
----------------------------------------------------
```

---

## Testing

Execute the automated test suite with Python's built-in `unittest`:

```bash
cd GPS/
python3 -m unittest tests/test_gps.py -v
```

All tests run against synthetic numbering-plan fixtures and mock coordinates without accessing external networks.

---

## Troubleshooting

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `GPS: command not found` | `~/.local/bin` is not in your shell `$PATH` | Run `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc` |
| `ModuleNotFoundError: phonenumbers` | Python environment not activated or pip install failed | Run `./install.sh` or `pip3 install -r requirements.txt` |
| `Browser does not open for my-location` | Running over headless SSH or Docker | Copy the printed URL `http://127.0.0.1:8765/location.html` into your client browser or use the manual coordinate prompt. |
| `Geolocation error: Permission denied` | Location blocked in browser privacy settings | Open browser site settings for `127.0.0.1` and set Location to "Allow". |

---

## Uninstallation

To cleanly remove GPS from your system:

```bash
cd GPS/
chmod +x uninstall.sh
./uninstall.sh
```

---

## Security & Ethics

GPS is strictly an educational telecom numbering inspection and permission-based utility. It does not perform packet interception, SS7 / Diameter network queries, covert subscriber location tracking, or credential harvesting.
