# GPS

A privacy-focused Python CLI tool for Kali Linux and WSL 2 that provides phone number validation, available region and carrier metadata, Google Maps search links, and consent-based GPS access for your own device.

**Developer:** [rishiraj-agent](https://github.com/rishiraj-agent)  
**Repository:** https://github.com/rishiraj-agent/GPS

## Features

- Phone number validation and formatting
- Country calling code and region metadata
- Available carrier and general-area information
- Google Maps search integration
- Permission-based GPS access for your own device
- Professional terminal interface
- Kali Linux and WSL 2 support
- Privacy-focused design

## Requirements

- Kali Linux or Kali Linux on WSL 2
- Python 3
- Git
- Internet connection for installation and metadata packages

## Installation on Kali Linux

### Method 1: Clone the GitHub repository

Open your Kali Linux terminal and run:

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip

git clone https://github.com/rishiraj-agent/GPS.git

cd GPS
```

### Method 2: Run the installer

If the repository contains `install.sh`, run:

```bash
chmod +x install.sh
./install.sh
```

After installation, follow the instructions printed by the installer.

### Method 3: Manual Python installation

Use this method if the repository contains `requirements.txt` and the application source files, but no working installer.

```bash
cd GPS

python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements.txt
```

If `requirements.txt` is not available, install the required phone-number library:

```bash
python -m pip install phonenumbers
```

Run the application using the entry point provided by the project. For example, if the main file is `main.py`:

```bash
python main.py
```

If the project provides a `gps` launcher instead:

```bash
chmod +x gps
./gps --help
```

## Usage

Once the CLI launcher is installed and configured, the intended commands are:

**Launch the tool**

```bash
GPS
```

**Show help**

```bash
GPS --help
```

**Look up phone number metadata**

```bash
GPS lookup +919876543210
```

**Specify the numbering region**

```bash
GPS lookup 9876543210 --region IN
```

**Check a US number**

```bash
GPS lookup 2025550123 --region US
```

**Request your own device's location**

```bash
GPS my-location
```

**Display the version**

```bash
GPS --version
```

*Note: These commands require the corresponding features to be implemented in the repository.*

## Google Maps Integration

GPS can generate Google Maps search links using available general-area metadata or coordinates explicitly shared by the current device user.

Phone-number metadata does not identify a subscriber's exact location.

## Privacy and Security

GPS is designed for legitimate, consent-based use.

- A phone number alone cannot reveal someone's exact live GPS location.
- Private subscriber identity is not retrieved.
- GPS access requires the device user's permission.
- Location coordinates should not be transmitted without explicit consent.
- Carrier and geographic metadata may be incomplete or outdated.

## Troubleshooting

**Python is not installed**

```bash
sudo apt install -y python3 python3-venv python3-pip
```

**Git is not installed**

```bash
sudo apt install -y git
```

**Virtual environment activation fails**

```bash
source .venv/bin/activate
```

**The `GPS` command is not found**

Run the project launcher from the repository directory:

```bash
./gps --help
```

If you want to run `GPS` globally, configure the installer to place the launcher in `~/.local/bin` and ensure that directory is included in your `PATH`.

**GPS permission denied**

Open the location page in a supported browser and grant location access only if you want to share your own device's location. Check your device's location settings if needed.

## Uninstallation

If the repository provides an `uninstall.sh` script, follow its documented instructions. Otherwise, deactivate the virtual environment and remove only the GPS project directory if you no longer need it.

```bash
deactivate
cd ..
```

Review the directory before deleting it so that you do not remove unrelated files.

## License

Add your chosen open-source license to the repository, for example, an MIT License, before describing the project as MIT-licensed.

## Author

**Rishi Raj**

GitHub: https://github.com/rishiraj-agent

---

**Disclaimer:** GPS provides phone-number metadata and consent-based device-location features. It is not a phone tracker and cannot locate a person using only their phone number.
