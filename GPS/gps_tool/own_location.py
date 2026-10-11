"""Consent-based local device GPS location module."""
import json
import os
import socket
import sys
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
from typing import Optional, Tuple
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
    print_divider,
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
    server_instance: Optional[HTTPServer] = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=self.web_directory, **kwargs)

    def log_message(self, format, *args):
        # Suppress noisy HTTP request logging in terminal
        pass

    def do_POST(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/api/location":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                LocationConsentHandler.received_location = data
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(f'{{"error":"{str(e)}"}}'.encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()


def find_free_port(preferred_port: int = 8765) -> int:
    """Find an open TCP port on localhost."""
    for port in range(preferred_port, preferred_port + 50):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("127.0.0.1", port))
                return port
        except OSError:
            continue
    return preferred_port


def request_own_location(timeout_seconds: int = 45) -> None:
    """Prompt the user and start a local consent-based browser interface for GPS."""
    print_section("DEVICE GPS LOCATION REQUEST")
    print()
    print_info("Privacy Policy & Consent Verification:")
    print("    1. This tool requests GPS coordinates of YOUR CURRENT DEVICE ONLY.")
    print("    2. A phone number CANNOT and WILL NEVER be used to retrieve live GPS.")
    print("    3. No coordinates are transmitted to external servers or third parties.")
    print("    4. Explicit permission must be granted in your browser.")
    print()

    # Locate web assets directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    web_dir = os.path.join(base_dir, "web")
    if not os.path.isdir(web_dir):
        print_error(f"Web interface directory not found at: {web_dir}")
        return

    port = find_free_port(8765)
    LocationConsentHandler.web_directory = web_dir
    LocationConsentHandler.received_location = None

    try:
        httpd = HTTPServer(("127.0.0.1", port), LocationConsentHandler)
        LocationConsentHandler.server_instance = httpd
    except Exception as e:
        print_error(f"Unable to start local consent HTTP server: {e}")
        _offer_manual_input_fallback()
        return

    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    url = f"http://127.0.0.1:{port}/location.html"
    print_info(f"Local consent interface active at: {colorize(url, CYAN)}")
    print_info("Opening browser window... (If not opening automatically, copy the URL above)")

    try:
        opened = webbrowser.open(url)
    except Exception:
        opened = False

    print_info("Awaiting user permission in browser (Press Ctrl+C to cancel)...")

    start_time = time.time()
    result = None

    try:
        while time.time() - start_time < timeout_seconds:
            if LocationConsentHandler.received_location is not None:
                result = LocationConsentHandler.received_location
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        print()
        print_warning("Location request cancelled by user.")
        httpd.shutdown()
        return

    httpd.shutdown()
    print()

    if not result:
        print_warning("Location request timed out or was not submitted via browser.")
        _offer_manual_input_fallback()
        return

    if "error" in result:
        print_error(f"Browser geolocation error: {result['error']}")
        if "denied" in str(result['error']).lower():
            print_info("Reason: Location permission was explicitly denied in browser settings.")
        elif "unavailable" in str(result['error']).lower():
            print_info("Reason: Device location sensor is unavailable or disabled.")
        elif "timeout" in str(result['error']).lower():
            print_info("Reason: Geolocation request timed out.")
        _offer_manual_input_fallback()
        return

    try:
        lat = float(result.get("latitude", 0.0))
        lng = float(result.get("longitude", 0.0))
        acc = float(result.get("accuracy", 0.0))
        maps_link = build_coordinates_url(lat, lng)

        print_success("User location retrieved successfully with explicit consent.")
        print()
        print_section("CURRENT DEVICE GPS METADATA")
        print_field("Consent Status", "Granted explicitly by device user", highlight=True)
        print_field("Latitude", f"{lat:.6f}")
        print_field("Longitude", f"{lng:.6f}")
        print_field("Reported Accuracy", f"±{acc:.1f} metres")
        print()
        print_section("GOOGLE MAPS NAVIGATION")
        print_field("Coordinates Link", maps_link)
        print()
        print_info("Note: Coordinates reflect your client device location, NOT any phone subscriber.")
        
    except (ValueError, TypeError) as err:
        print_error(f"Failed to parse location data: {err}")


def _offer_manual_input_fallback() -> None:
    """Fallback allowing manual coordinate validation and Google Maps URL creation."""
    print_divider()
    print_info("Manual Coordinate Testing Fallback:")
    print("If running in a headless Kali terminal (SSH/Docker/WSL without desktop GUI),")
    print("you can test coordinate mapping and URL generation manually.")
    
    # Check if stdin is interactive
    if not sys.stdin.isatty():
        return
        
    try:
        choice = input(colorize("[?] Would you like to enter test coordinates manually? [y/N]: ", YELLOW)).strip().lower()
        if choice not in ("y", "yes"):
            return

        lat_input = input("Enter Latitude (-90 to 90): ").strip()
        lng_input = input("Enter Longitude (-180 to 180): ").strip()
        lat = float(lat_input)
        lng = float(lng_input)

        if not (-90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0):
            print_error("Coordinates out of geographic range.")
            return

        maps_link = build_coordinates_url(lat, lng)
        print()
        print_section("MANUAL COORDINATE SUMMARY")
        print_field("Latitude", f"{lat:.6f}")
        print_field("Longitude", f"{lng:.6f}")
        print_field("Coordinates Link", maps_link)
        print()
    except (ValueError, EOFError, KeyboardInterrupt):
        print()
        print_warning("Input cancelled or invalid format.")
