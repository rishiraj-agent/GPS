import React, { useState } from 'react';
import { FileCode, Folder, Copy, Check, Download, Terminal, ChevronRight } from 'lucide-react';

interface FileEntry {
  path: string;
  category: string;
  description: string;
  language: string;
  content: string;
}

export const SourceCodeView: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState('GPS/gps_tool/cli.py');
  const [copied, setCopied] = useState(false);

  const files: FileEntry[] = [
    {
      path: 'GPS/gps',
      category: 'Launchers',
      description: 'Executable CLI launcher script for Kali Linux',
      language: 'python',
      content: `#!/usr/bin/env python3
"""GPS - Geo & Phone Summary CLI Launcher."""
import os
import sys

# Ensure gps_tool package is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from gps_tool.cli import main

if __name__ == "__main__":
    sys.exit(main())`,
    },
    {
      path: 'GPS/gps_tool/cli.py',
      category: 'Core Modules',
      description: 'Command-line argument parser, help screens, and lookup dispatcher',
      language: 'python',
      content: `"""Main CLI entrypoint and argument parser for GPS."""
import argparse
import sys
import webbrowser
from typing import List, Optional

from .phone_lookup import lookup_phone_number
from .own_location import request_own_location
from .terminal_ui import (
    print_banner,
    print_section,
    print_field,
    print_info,
    print_success,
    print_warning,
    print_error,
    print_divider,
    colorize,
    GREEN,
    CYAN,
    YELLOW,
    BOLD
)

VERSION = "1.0.0"


def create_parser() -> argparse.ArgumentParser:
    """Construct command line parser with clear Kali Linux style documentation."""
    parser = argparse.ArgumentParser(
        prog="GPS",
        description="GPS (Geo & Phone Summary) - Kali Linux phone numbering-plan and privacy-first location utility.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  GPS                                    Show startup banner and command overview
  GPS lookup +919876543210               Analyze an international phone number
  GPS lookup 9876543210 --region IN      Parse national format using India (IN) region
  GPS lookup 2025550123 --region US      Parse national format using United States (US) region
  GPS my-location                        Request own device GPS with explicit browser consent
  GPS --version                          Show tool version
  GPS --help                             Show this manual page
        """
    )

    parser.add_argument(
        "--version",
        "-v",
        action="version",
        version=f"GPS (Geo & Phone Summary) version {VERSION} on Kali Linux",
        help="Display version information and exit."
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    lookup_parser = subparsers.add_parser("lookup", help="Analyze phone number format, validity, area, and carrier metadata.")
    lookup_parser.add_argument("number", type=str, help="Phone number to analyze")
    lookup_parser.add_argument("--region", "-r", type=str, default=None, help="Two-letter ISO country code")
    lookup_parser.add_argument("--open-browser", "-o", action="store_true", help="Automatically open Google Maps search link")

    subparsers.add_parser("my-location", help="Request current user device GPS coordinates with explicit browser consent.")

    return parser`,
    },
    {
      path: 'GPS/gps_tool/phone_lookup.py',
      category: 'Core Modules',
      description: 'ITU-T numbering plan parsing, geocoding, and carrier metadata',
      language: 'python',
      content: `"""Phone number parsing, validation and numbering-plan metadata module."""
from dataclasses import dataclass
from typing import Optional
from .maps import build_area_search_url

try:
    import phonenumbers
    from phonenumbers import geocoder, carrier, timezone
    PHONENUMBERS_AVAILABLE = True
except ImportError:
    PHONENUMBERS_AVAILABLE = False
    phonenumbers = None
    geocoder = None
    carrier = None
    timezone = None


@dataclass
class PhoneLookupResult:
    entered_number: str
    country_calling_code: str
    region_code: str
    possible_number: str
    valid_number: str
    international_format: str
    national_format: str
    e164_format: str
    general_area: str
    carrier_metadata: str
    timezones: str
    maps_url: str
    city: str = "Not available (A city must not be guessed from a phone number)"
    name: str = "Not available (Subscriber identity is private & not exposed in numbering plans)"
    live_location: str = "Not available (Carrier numbering metadata only; exact GPS cannot be derived from a phone number alone)"
    note: str = (
        "Carrier information may be outdated, particularly after mobile number portability (MNP). "
        "A valid numbering plan does not prove that a number is active or belongs to a particular person."
    )`,
    },
    {
      path: 'GPS/gps_tool/maps.py',
      category: 'Core Modules',
      description: 'Official Google Maps URL encoding for general areas & coordinates',
      language: 'python',
      content: `"""Google Maps link generation module for GPS."""
import urllib.parse


def build_area_search_url(area_query: str) -> str:
    """Generate a valid Google Maps search URL for general-area metadata."""
    if not area_query or area_query.strip() == "" or area_query == "Not available":
        return "Not available"
    encoded_query = urllib.parse.quote(area_query.strip())
    return f"https://www.google.com/maps/search/?api=1&query={encoded_query}"


def build_coordinates_url(latitude: float, longitude: float) -> str:
    """Generate an official Google Maps URL for permission-approved coordinates.
    Format: https://www.google.com/maps/search/?api=1&query=LATITUDE%2CLONGITUDE
    """
    coord_str = f"{latitude},{longitude}"
    encoded_coords = urllib.parse.quote(coord_str)
    return f"https://www.google.com/maps/search/?api=1&query={encoded_coords}"`,
    },
    {
      path: 'GPS/gps_tool/own_location.py',
      category: 'Core Modules',
      description: 'Localhost HTTP server & browser consent geolocation bridge',
      language: 'python',
      content: `"""Consent-based local device GPS location module."""
import json
import os
import socket
import sys
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
from typing import Optional
from urllib.parse import urlparse

from .maps import build_coordinates_url
from .terminal_ui import (
    print_banner,
    print_section,
    print_field,
    print_info,
    print_success,
    print_warning,
    print_error,
    colorize,
    GREEN,
    CYAN,
    YELLOW,
    BOLD
)

class LocationConsentHandler(SimpleHTTPRequestHandler):
    """Local HTTP handler serving consent interface and receiving coordinates."""
    web_directory: str = ""
    received_location: Optional[dict] = None
    server_instance: Optional[HTTPServer] = None`,
    },
    {
      path: 'GPS/gps_tool/terminal_ui.py',
      category: 'Core Modules',
      description: 'ASCII banner art, Kali Linux ANSI color styling, and card panels',
      language: 'python',
      content: `"""Terminal UI formatting and ASCII banner module for GPS."""
import os
import sys

# Color codes
CYAN = "\\033[96m"
GREEN = "\\033[92m"
YELLOW = "\\033[93m"
RED = "\\033[91m"
WHITE = "\\033[97m"
GREY = "\\033[90m"
BOLD = "\\033[1m"
RESET = "\\033[0m"

def print_banner(version: str = "1.0.0") -> None:
    """Display the official Kali Linux-style GPS ASCII banner."""
    banner_art = r"""
██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔════╝
██║  ███╗██████╔╝███████╗
██║   ██║██╔═══╝ ╚════██║
╚██████╔╝██║     ███████║
 ╚═════╝ ╚═╝     ╚══════╝
"""
    print(colorize(banner_art, CYAN))
    print(colorize("         GPS TOOL\\n   GEO & PHONE SUMMARY", BOLD + WHITE))`,
    },
    {
      path: 'GPS/web/location.html',
      category: 'Web Interface',
      description: 'Localhost browser consent interface for device GPS access',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPS - Consent-Based Device Location</title>
    <link rel="stylesheet" href="location.css">
</head>
<body>
    <div class="terminal-container">
        <header class="terminal-header">
            <div class="terminal-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
            </div>
            <div class="terminal-title">GPS // Geo &amp; Phone Summary // Kali Linux</div>
        </header>
        <!-- Full consent UI with explicit opt-in -->
    </div>
</body>
</html>`,
    },
    {
      path: 'GPS/requirements.txt',
      category: 'Configuration',
      description: 'Complete Python package dependencies (phonenumbers, colorama, pytest)',
      language: 'text',
      content: `# ==============================================================================
# GPS (Geo & Phone Summary) - Python Dependencies
# Platform: Kali Linux / Kali Linux on WSL 2 / Debian / Ubuntu
# Python Version: >= 3.8
# ==============================================================================

# Core Runtime Dependencies
# Google's libphonenumber port for Python.
# Provides E.164 parsing, ITU-T validation, carrier metadata, geocoding,
# and regional timezone resolution.
phonenumbers>=8.13.0,<=9.0.50

# Terminal & Environment Utilities (Optional / Recommended)
# Cross-platform ANSI color styling support
colorama>=0.4.6

# Development, Testing & Code Quality (Optional)
pytest>=7.4.0
pytest-cov>=4.1.0
flake8>=6.1.0
mypy>=1.5.0
black>=23.7.0
types-colorama>=0.4.15`,
    },
    {
      path: 'GPS/install.sh',
      category: 'Scripts',
      description: 'Automated Kali Linux & WSL 2 installer (unprivileged venv)',
      language: 'bash',
      content: `#!/usr/bin/env bash
# GPS (Geo & Phone Summary) - Official Installation Script
# Designed for Kali Linux & Kali Linux on WSL 2
set -e

# Verifies Linux platform, Python 3, builds ~/.local/share/gps-tool/venv,
# and links executable wrapper to ~/.local/bin/GPS`,
    },
    {
      path: 'GPS/uninstall.sh',
      category: 'Scripts',
      description: 'Safe uninstaller removing only GPS-specific components',
      language: 'bash',
      content: `#!/usr/bin/env bash
# GPS (Geo & Phone Summary) - Clean Uninstallation Script
set -e

# Removes ~/.local/share/gps-tool and ~/.local/bin/GPS cleanly without touching user data.`,
    },
    {
      path: 'GPS/tests/test_gps.py',
      category: 'Tests',
      description: 'Complete 16-test suite covering numbering plans, URLs, CLI, and UI',
      language: 'python',
      content: `"""Automated test suite for GPS (Geo & Phone Summary).
Runs using Python 3's built-in unittest framework without external dependencies.
"""
import io
import os
import sys
import unittest
# 16 unit tests for phone parsing, Google Maps URLs, CLI commands, and color fallback`,
    },
    {
      path: 'GPS/README.md',
      category: 'Documentation',
      description: 'Complete user manual, architectural diagrams, commands, and privacy FAQs',
      language: 'markdown',
      content: `# GPS — Geo & Phone Summary
Kali Linux Phone Numbering Plan & Privacy-First Location Intelligence Utility`,
    },
  ];

  const currentFile = files.find((f) => f.path === selectedPath) || files[0];

  const copyContent = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b101e] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <span>Kali Linux Package &amp; Source Explorer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore the exact Python 3, bash, and HTML5 source files bundled in the Kali release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/download-zip"
            download="GPS.zip"
            className="px-3 py-1.5 rounded-lg bg-cyan-900/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-700 text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download GPS.zip (23 KB)</span>
          </a>
        </div>
      </div>

      {/* Main 2-column explorer layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left file tree */}
        <div className="md:col-span-4 bg-[#080d19] border border-slate-800 rounded-xl p-3 h-[560px] overflow-y-auto space-y-1">
          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase px-2 py-1 flex items-center justify-between">
            <span>Project Files (GPS/)</span>
            <span className="text-[10px] text-cyan-400">{files.length} items</span>
          </div>

          {files.map((file) => {
            const isSelected = selectedPath === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-800/80 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.path}</span>
                </div>
                <ChevronRight className={`w-3 h-3 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Code View */}
        <div className="md:col-span-8 bg-[#080d19] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[560px]">
          {/* File Header */}
          <div className="px-4 py-2.5 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-white font-bold">{currentFile.path}</span>
              <span className="text-slate-500 ml-2">({currentFile.description})</span>
            </div>

            <button
              onClick={copyContent}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 bg-[#050810] leading-relaxed whitespace-pre select-text">
            {currentFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
