"""Terminal UI formatting and ASCII banner module for GPS."""
import os
import sys

# Color codes
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
WHITE = "\033[97m"
GREY = "\033[90m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


def colors_supported() -> bool:
    """Check if ANSI colors are supported in the current environment."""
    if os.environ.get("NO_COLOR") or os.environ.get("TERM") == "dumb":
        return False
    return sys.stdout.isatty() or os.environ.get("FORCE_COLOR") == "1"


def colorize(text: str, color_code: str) -> str:
    """Return text wrapped with ANSI color if supported, else raw text."""
    if colors_supported():
        return f"{color_code}{text}{RESET}"
    return text


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
    title = "         GPS TOOL\n   GEO & PHONE SUMMARY"
    print(colorize(title, BOLD + WHITE))
    print()
    print(colorize("[*] Platform: Kali Linux / WSL 2", GREY))
    print(colorize("[*] Mode: Privacy-first analysis", GREY))
    print(colorize(f"[*] Version: {version}", GREY))
    print(colorize("-" * 52, GREY))
    print()


def print_section(title: str) -> None:
    """Print a section header."""
    header = f"[{title.upper()}]"
    print(colorize(header, BOLD + CYAN))


def print_field(label: str, value: str, highlight: bool = False) -> None:
    """Print an aligned field label and value."""
    formatted_label = f"{label:<22}: "
    if highlight:
        formatted_value = colorize(value, GREEN)
    elif value in ("Not available", "No", "Invalid"):
        formatted_value = colorize(value, YELLOW)
    elif value.startswith("http"):
        formatted_value = colorize(value, CYAN)
    else:
        formatted_value = colorize(value, WHITE)
    print(f"{colorize(formatted_label, GREY)}{formatted_value}")


def print_success(message: str) -> None:
    """Print a success message in green."""
    print(f"{colorize('[+]', GREEN)} {colorize(message, WHITE)}")


def print_info(message: str) -> None:
    """Print an informational message."""
    print(f"{colorize('[*]', CYAN)} {colorize(message, WHITE)}")


def print_warning(message: str) -> None:
    """Print a warning message in yellow."""
    print(f"{colorize('[!]', YELLOW)} {colorize(message, YELLOW)}")


def print_error(message: str) -> None:
    """Print an error message in red."""
    print(f"{colorize('[-]', RED)} {colorize(message, RED)}")


def print_divider() -> None:
    """Print a subtle divider line."""
    print(colorize("-" * 52, GREY))
