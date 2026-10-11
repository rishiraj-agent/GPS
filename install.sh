#!/usr/bin/env bash
# ==============================================================================
# GPS (Geo & Phone Summary) - Official Installation Script
# Designed for Kali Linux & Kali Linux on WSL 2
# ==============================================================================

set -e

CYAN='\033[96m'
GREEN='\033[92m'
YELLOW='\033[93m'
RED='\033[91m'
GREY='\033[90m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "██████╗ ██████╗ ███████╗"
echo "██╔════╝ ██╔══██╗██╔════╝"
echo "██║  ███╗██████╔╝███████╗"
echo "██║   ██║██╔═══╝ ╚════██║"
echo "╚██████╔╝██║     ███████║"
echo " ╚═════╝ ╚═╝     ╚══════╝"
echo "       GPS TOOL INSTALLER"
echo -e "${RESET}"

echo -e "${GREY}[*] Checking operating system...${RESET}"
OS_TYPE="$(uname -s)"
if [ "$OS_TYPE" != "Linux" ]; then
    echo -e "${RED}[-] Error: GPS is engineered for Linux / Kali Linux. Detected: $OS_TYPE${RESET}"
    exit 1
fi
echo -e "${GREEN}[+] Platform verified: Linux ($(uname -r))${RESET}"

# Check for Python 3
echo -e "${GREY}[*] Checking Python 3 installation...${RESET}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[-] Python 3 was not found. Please install Python 3:${RESET}"
    echo "    sudo apt update && sudo apt install -y python3 python3-pip python3-venv"
    exit 1
fi
PYTHON_VER="$(python3 --version 2>&1)"
echo -e "${GREEN}[+] Found $PYTHON_VER${RESET}"

# Determine installation directories
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$APP_DIR/GPS/gps_tool" ]; then
    SOURCE_DIR="$APP_DIR/GPS"
elif [ -d "$APP_DIR/gps_tool" ]; then
    SOURCE_DIR="$APP_DIR"
elif [ -d "./GPS/gps_tool" ]; then
    SOURCE_DIR="./GPS"
else
    SOURCE_DIR="$APP_DIR"
fi

INSTALL_TARGET_DIR="$HOME/.local/share/gps-tool"
BIN_DIR="$HOME/.local/bin"
LAUNCHER="$BIN_DIR/GPS"
LAUNCHER_LOWER="$BIN_DIR/gps"

echo -e "${GREY}[*] Preparing isolated directory at: $INSTALL_TARGET_DIR${RESET}"
mkdir -p "$INSTALL_TARGET_DIR"
mkdir -p "$BIN_DIR"

# Copy package files cleanly
echo -e "${GREY}[*] Copying GPS application files from $SOURCE_DIR...${RESET}"
cp -r "$SOURCE_DIR/gps_tool" "$INSTALL_TARGET_DIR/"
cp -r "$SOURCE_DIR/web" "$INSTALL_TARGET_DIR/"
cp "$SOURCE_DIR/requirements.txt" "$INSTALL_TARGET_DIR/" 2>/dev/null || cp "$APP_DIR/requirements.txt" "$INSTALL_TARGET_DIR/"
cp "$APP_DIR/README.md" "$INSTALL_TARGET_DIR/"

# Setup Python Virtual Environment (clean and unprivileged)
VENV_PATH="$INSTALL_TARGET_DIR/venv"
if [ ! -d "$VENV_PATH" ]; then
    echo -e "${GREY}[*] Creating isolated Python virtual environment...${RESET}"
    if python3 -m venv "$VENV_PATH" 2>/dev/null; then
        echo -e "${GREEN}[+] Virtual environment initialized at $VENV_PATH${RESET}"
    else
        echo -e "${YELLOW}[!] python3-venv package might be missing. Attempting without venv isolation...${RESET}"
    fi
fi

# Install dependencies inside venv
if [ -d "$VENV_PATH" ]; then
    echo -e "${GREY}[*] Installing dependencies via venv pip...${RESET}"
    "$VENV_PATH/bin/pip" install --upgrade pip >/dev/null 2>&1 || true
    "$VENV_PATH/bin/pip" install -r "$INSTALL_TARGET_DIR/requirements.txt"
    PYTHON_EXEC="$VENV_PATH/bin/python3"
else
    echo -e "${GREY}[*] Installing dependencies with pip --user...${RESET}"
    pip3 install --user -r "$INSTALL_TARGET_DIR/requirements.txt" || true
    PYTHON_EXEC="$(command -v python3)"
fi

# Generate Launcher wrapper script
echo -e "${GREY}[*] Creating executable launcher: $LAUNCHER${RESET}"
cat << EOF > "$LAUNCHER"
#!/usr/bin/env bash
# GPS CLI Launcher Wrapper
export PYTHONPATH="$INSTALL_TARGET_DIR:\$PYTHONPATH"
exec "$PYTHON_EXEC" -m gps_tool.cli "\$@"
EOF

chmod +x "$LAUNCHER"
# Also provide lowercase link for convenience
ln -sf "$LAUNCHER" "$LAUNCHER_LOWER"

echo -e "${GREEN}[+] Launcher created at: $LAUNCHER${RESET}"

# Verify PATH
echo -e "${GREY}[*] Verifying PATH environment...${RESET}"
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo -e "${YELLOW}[!] Notice: $BIN_DIR is not currently in your system PATH.${RESET}"
    echo -e "${YELLOW}[!] Add it permanently by running:${RESET}"
    echo ""
    echo -e "    ${BOLD}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc${RESET}"
    echo -e "    ${BOLD}source ~/.bashrc${RESET}"
    echo ""
else
    echo -e "${GREEN}[+] $BIN_DIR is already present in PATH.${RESET}"
fi

echo -e "${GREEN}${BOLD}"
echo "=============================================================="
echo "      GPS (Geo & Phone Summary) Installed Successfully!"
echo "=============================================================="
echo -e "${RESET}"
echo -e "Quick test commands:"
echo -e "  ${CYAN}GPS${RESET}                              # Display startup banner"
echo -e "  ${CYAN}GPS --help${RESET}                       # Show manual and arguments"
echo -e "  ${CYAN}GPS lookup +919876543210${RESET}         # Analyze phone number"
echo -e "  ${CYAN}GPS my-location${RESET}                  # Consent-based device GPS"
echo ""
