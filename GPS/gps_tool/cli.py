"""Main CLI entrypoint and argument parser for GPS."""
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

    # lookup subparser
    lookup_parser = subparsers.add_parser(
        "lookup",
        help="Analyze phone number format, validity, area, and carrier metadata."
    )
    lookup_parser.add_argument(
        "number",
        type=str,
        help="Phone number to analyze (e.g. +919876543210 or national digits with --region)"
    )
    lookup_parser.add_argument(
        "--region",
        "-r",
        type=str,
        default=None,
        help="Two-letter ISO country code for national numbers (e.g. IN, US, GB, DE)"
    )
    lookup_parser.add_argument(
        "--open-browser",
        "-o",
        action="store_true",
        help="Automatically open Google Maps search link in browser"
    )

    # my-location subparser
    subparsers.add_parser(
        "my-location",
        help="Request current user device GPS coordinates with explicit browser consent."
    )

    return parser


def handle_lookup(number: str, region: Optional[str], auto_open: bool = False) -> int:
    """Execute phone number lookup and display structured panels."""
    print_banner(VERSION)
    print_info(f"Analyzing phone number input: {colorize(number, BOLD)}")
    if region:
        print_info(f"Using default region code: {colorize(region.upper(), CYAN)}")
    print()

    try:
        res = lookup_phone_number(number, region)
    except ValueError as e:
        print_error(str(e))
        print_info("Tips:")
        print("  - For international numbers, prepend with '+' and country code (e.g. +91...).")
        print("  - For domestic digits, supply '--region XX' (e.g. '--region US' or '--region IN').")
        return 1

    print_section("PHONE NUMBER ANALYSIS")
    print_field("Number", res.entered_number, highlight=True)
    print_field("Country Calling Code", res.country_calling_code)
    print_field("Region Code", res.region_code)
    print_field("Possible Number", res.possible_number)
    print_field("Valid Number", res.valid_number)
    print_field("International Format", res.international_format)
    print_field("National Format", res.national_format)
    print_field("E.164 Format", res.e164_format)
    print_field("General Area", res.general_area)
    print_field("Carrier Metadata", res.carrier_metadata)
    print_field("Time Zones", res.timezones)
    print_field("City", res.city)
    print_field("Name", res.name)
    print_field("Live Location", res.live_location)
    print()

    print_section("GOOGLE MAPS")
    print_field("Search General Area", res.maps_url)
    print()

    print_divider()
    print_warning(res.note)
    print_divider()
    print()

    if res.maps_url and res.maps_url != "Not available":
        if auto_open:
            print_info("Opening Google Maps in web browser...")
            try:
                webbrowser.open(res.maps_url)
            except Exception:
                pass
        elif sys.stdin.isatty():
            try:
                choice = input(colorize("[?] Open Google Maps general-area search in browser? [y/N]: ", YELLOW)).strip().lower()
                if choice in ("y", "yes"):
                    webbrowser.open(res.maps_url)
            except (EOFError, KeyboardInterrupt):
                pass

    return 0


def main(args: Optional[List[str]] = None) -> int:
    """Entry point for the GPS CLI."""
    if args is None:
        args = sys.argv[1:]

    parser = create_parser()

    # If no arguments provided, show banner and quick reference
    if not args:
        print_banner(VERSION)
        print_section("QUICK USAGE REFERENCE")
        print("  GPS lookup <phone_number>               Lookup international number")
        print("  GPS lookup <digits> --region <ISO2>     Lookup national number (e.g. --region IN)")
        print("  GPS my-location                         Request own device GPS coordinates")
        print("  GPS --help                              Show comprehensive CLI flags")
        print("  GPS --version                           Display software release version")
        print()
        print_info("Privacy Statement:")
        print("  GPS never discloses subscriber names, live GPS tracking, or private call logs.")
        print("  Public numbering plans provide only country codes, area prefixes, and carrier blocks.")
        print()
        return 0

    parsed = parser.parse_args(args)

    if parsed.command == "lookup":
        return handle_lookup(parsed.number, parsed.region, getattr(parsed, "open_browser", False))
    elif parsed.command == "my-location":
        print_banner(VERSION)
        request_own_location()
        return 0
    else:
        parser.print_help()
        return 0


if __name__ == "__main__":
    sys.exit(main())
