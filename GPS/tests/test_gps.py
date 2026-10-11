"""Automated test suite for GPS (Geo & Phone Summary).
Runs using Python 3's built-in unittest framework without external dependencies.
"""
import io
import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from gps_tool.maps import build_area_search_url, build_coordinates_url
from gps_tool.phone_lookup import lookup_phone_number, PhoneLookupResult
from gps_tool.cli import create_parser, handle_lookup, main, VERSION
from gps_tool.terminal_ui import colors_supported, colorize, print_banner


class TestGoogleMapsModule(unittest.TestCase):
    """Test URL generation and encoding for Google Maps queries."""

    def test_area_search_url_encoding(self):
        """Test URL encoding for spaces and special characters in area descriptions."""
        url = build_area_search_url("New York, NY")
        self.assertEqual(url, "https://www.google.com/maps/search/?api=1&query=New%20York%2C%20NY")

    def test_area_search_url_empty_or_unavailable(self):
        """Test fallback when area description is unavailable or empty."""
        self.assertEqual(build_area_search_url(""), "Not available")
        self.assertEqual(build_area_search_url("Not available"), "Not available")
        self.assertEqual(build_area_search_url(None), "Not available")

    def test_coordinates_url_encoding(self):
        """Test coordinate URL formatting using official Google Maps format."""
        lat = 37.422065
        lng = -122.084089
        url = build_coordinates_url(lat, lng)
        self.assertEqual(url, "https://www.google.com/maps/search/?api=1&query=37.422065%2C-122.084089")

    def test_coordinates_url_boundary_values(self):
        """Test boundary coordinates (Equator, Prime Meridian, South Pole)."""
        url_origin = build_coordinates_url(0.0, 0.0)
        self.assertEqual(url_origin, "https://www.google.com/maps/search/?api=1&query=0.0%2C0.0")

        url_south = build_coordinates_url(-90.0, 180.0)
        self.assertEqual(url_south, "https://www.google.com/maps/search/?api=1&query=-90.0%2C180.0")


class TestPhoneLookupModule(unittest.TestCase):
    """Test phone number parsing, validation, and metadata extraction."""

    def test_valid_international_number(self):
        """Test parsing a valid synthetic international number with country code."""
        # Standard ITU dummy / test ranges
        res = lookup_phone_number("+919876543210")
        self.assertIsInstance(res, PhoneLookupResult)
        self.assertEqual(res.country_calling_code, "+91")
        self.assertEqual(res.region_code, "IN")
        self.assertIn("+91", res.e164_format)
        self.assertIn("google.com/maps", res.maps_url)
        # Privacy guarantees
        self.assertIn("Not available", res.city)
        self.assertIn("Not available", res.name)
        self.assertIn("Not available", res.live_location)

    def test_national_number_with_region(self):
        """Test parsing a national number supplied with ISO region code."""
        res = lookup_phone_number("2025550123", default_region="US")
        self.assertEqual(res.country_calling_code, "+1")
        self.assertEqual(res.region_code, "US")
        self.assertIn("+12025550123", res.e164_format)

    def test_empty_number_raises_value_error(self):
        """Test that empty or whitespace input raises ValueError with helpful message."""
        with self.assertRaises(ValueError) as ctx:
            lookup_phone_number("   ")
        self.assertIn("cannot be empty", str(ctx.exception))

    def test_invalid_syntax_number(self):
        """Test parsing completely invalid alphanumeric text."""
        # E.g. 'abcdef'
        try:
            res = lookup_phone_number("invalid-phone-string")
            # If fallback is used, it returns checking status
            self.assertIsNotNone(res)
        except ValueError as err:
            # If phonenumbers is used, it should raise ValueError
            self.assertIn("Unable to parse", str(err))


class TestCommandLineInterface(unittest.TestCase):
    """Test argument parsing, banner, help, and CLI execution paths."""

    def setUp(self):
        self.parser = create_parser()

    def test_parser_version(self):
        """Test parser --version flag definition."""
        with self.assertRaises(SystemExit):
            with patch("sys.stdout", new_callable=io.StringIO):
                self.parser.parse_args(["--version"])

    def test_parser_lookup_subcommand(self):
        """Test parsing valid lookup arguments."""
        args = self.parser.parse_args(["lookup", "+12025550123", "--region", "US"])
        self.assertEqual(args.command, "lookup")
        self.assertEqual(args.number, "+12025550123")
        self.assertEqual(args.region, "US")

    def test_parser_my_location_subcommand(self):
        """Test parsing my-location command."""
        args = self.parser.parse_args(["my-location"])
        self.assertEqual(args.command, "my-location")

    def test_main_without_args_shows_overview(self):
        """Test running GPS without arguments exits with 0 and prints banner."""
        buf = io.StringIO()
        with patch("sys.stdout", buf):
            code = main([])
        self.assertEqual(code, 0)
        output = buf.getvalue()
        self.assertIn("GPS TOOL", output)
        self.assertIn("QUICK USAGE REFERENCE", output)

    def test_lookup_execution_valid(self):
        """Test handle_lookup returns 0 for a valid number."""
        buf = io.StringIO()
        with patch("sys.stdout", buf):
            code = handle_lookup("+919876543210", None, auto_open=False)
        self.assertEqual(code, 0)
        output = buf.getvalue()
        self.assertIn("PHONE NUMBER ANALYSIS", output)
        self.assertIn("Country Calling Code", output)
        self.assertIn("GOOGLE MAPS", output)

    def test_lookup_execution_invalid(self):
        """Test handle_lookup handles errors gracefully without crashing."""
        buf = io.StringIO()
        with patch("sys.stdout", buf):
            # 'abc' cannot be parsed as a phone number
            code = handle_lookup("abc", None, auto_open=False)
        output = buf.getvalue()
        # Either handled with error message or fallback, exits gracefully
        self.assertIn(code, (0, 1))


class TestTerminalUI(unittest.TestCase):
    """Test terminal aesthetics and color support detection."""

    def test_colors_supported_respects_no_color(self):
        """Ensure NO_COLOR environment variable disables ANSI colors."""
        with patch.dict(os.environ, {"NO_COLOR": "1"}):
            self.assertFalse(colors_supported())
            self.assertEqual(colorize("test", "\033[96m"), "test")

    def test_banner_printing(self):
        """Ensure banner prints version and required disclaimer labels."""
        buf = io.StringIO()
        with patch("sys.stdout", buf):
            print_banner("1.0.0")
        output = buf.getvalue()
        self.assertIn("GPS TOOL", output)
        self.assertIn("Kali Linux", output)
        self.assertIn("1.0.0", output)


if __name__ == "__main__":
    unittest.main()
