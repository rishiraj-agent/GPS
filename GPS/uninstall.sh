#!/usr/bin/env bash
# ==============================================================================
# GPS (Geo & Phone Summary) - Clean Uninstallation Script
# ==============================================================================

set -e

RED='\033[91m'
GREEN='\033[92m'
YELLOW='\033[93m'
GREY='\033[90m'
RESET='\033[0m'

echo -e "${YELLOW}[*] Preparing to uninstall GPS (Geo & Phone Summary)...${RESET}"

INSTALL_TARGET_DIR="$HOME/.local/share/gps-tool"
LAUNCHER="$HOME/.local/bin/GPS"
LAUNCHER_LOWER="$HOME/.local/bin/gps"

# Remove application directory
if [ -d "$INSTALL_TARGET_DIR" ]; then
    echo -e "${GREY}[*] Removing application files from $INSTALL_TARGET_DIR...${RESET}"
    rm -rf "$INSTALL_TARGET_DIR"
    echo -e "${GREEN}[+] Removed application directory.${RESET}"
else
    echo -e "${GREY}[*] Application directory $INSTALL_TARGET_DIR not found.${RESET}"
fi

# Remove launchers
if [ -f "$LAUNCHER" ]; then
    rm -f "$LAUNCHER"
    echo -e "${GREEN}[+] Removed launcher: $LAUNCHER${RESET}"
fi

if [ -L "$LAUNCHER_LOWER" ] || [ -f "$LAUNCHER_LOWER" ]; then
    rm -f "$LAUNCHER_LOWER"
    echo -e "${GREEN}[+] Removed symlink: $LAUNCHER_LOWER${RESET}"
fi

echo -e "${GREEN}[+] GPS has been completely and safely uninstalled.${RESET}"
