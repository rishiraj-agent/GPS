"""Phone number parsing, validation and numbering-plan metadata module."""
from dataclasses import dataclass
from typing import Optional
from .maps import build_area_search_url

# Optional phonenumbers imports with graceful fallback
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
    )


def lookup_phone_number(raw_number: str, default_region: Optional[str] = None) -> PhoneLookupResult:
    """Parse, validate, and retrieve metadata for a phone number.
    
    Args:
        raw_number: The raw phone number input (e.g. '+919876543210' or '2025550123')
        default_region: Two-letter ISO region code if number is national format (e.g. 'IN', 'US')
        
    Returns:
        PhoneLookupResult containing structured metadata.
        
    Raises:
        ValueError: If input format is invalid or cannot be parsed.
    """
    raw_cleaned = raw_number.strip()
    if not raw_cleaned:
        raise ValueError("Phone number cannot be empty.")

    if not PHONENUMBERS_AVAILABLE:
        # Graceful fallback if phonenumbers library is not installed yet
        return _basic_fallback_lookup(raw_cleaned, default_region)

    try:
        parsed = phonenumbers.parse(raw_cleaned, default_region.upper() if default_region else None)
    except phonenumbers.NumberParseException as e:
        raise ValueError(f"Unable to parse '{raw_number}': {e._msg}")

    is_possible = phonenumbers.is_possible_number(parsed)
    is_valid = phonenumbers.is_valid_number(parsed)

    region_code = phonenumbers.region_code_for_number(parsed) or "Not available"
    calling_code = f"+{parsed.country_code}" if parsed.country_code else "Not available"

    intl_format = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
    nat_format = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL)
    e164_format = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)

    # General area from geocoder
    try:
        area_desc = geocoder.description_for_number(parsed, "en") or ""
    except Exception:
        area_desc = ""
    if not area_desc.strip():
        area_desc = region_code if region_code != "Not available" else "Not available"

    # Carrier metadata
    try:
        carrier_name = carrier.name_for_number(parsed, "en") or ""
    except Exception:
        carrier_name = ""
    if not carrier_name.strip():
        # Check if number is fixed line or mobile
        num_type = phonenumbers.number_type(parsed)
        if num_type == phonenumbers.PhoneNumberType.FIXED_LINE:
            carrier_name = "Fixed Line / PSTN Wireline Network"
        elif num_type == phonenumbers.PhoneNumberType.TOLL_FREE:
            carrier_name = "Toll-Free Service Provider"
        else:
            carrier_name = "Assigned Mobile Network Allocation"

    # Timezones
    try:
        tz_list = timezone.time_zones_for_number(parsed)
        tz_str = ", ".join(tz_list) if tz_list else "Not available"
    except Exception:
        tz_str = "Not available"

    # City determination from geocoder and numbering plan
    num_type = phonenumbers.number_type(parsed)
    city_val = "Not available"
    if area_desc and area_desc != "Not available" and area_desc != region_code and area_desc not in ("India", "United States", "United Kingdom", "Germany", "France"):
        # Specific locality/city returned by geocoder (e.g. 'New Delhi', 'Washington D.C.', 'London')
        city_val = area_desc
    else:
        # Check telecom circle for India mobile series
        national_str = str(parsed.national_number)
        if region_code == "IN":
            circle_name = _resolve_india_telecom_circle(national_str)
            city_val = f"Not available at city level (Telecom Circle: {circle_name})"
        elif num_type == phonenumbers.PhoneNumberType.MOBILE:
            city_val = f"Not available (Mobile prefix allocated across {area_desc})"
        else:
            city_val = f"Not available (Exchange level routing in {area_desc})"

    maps_url = build_area_search_url(area_desc if area_desc != "Not available" else region_code)

    return PhoneLookupResult(
        entered_number=raw_cleaned,
        country_calling_code=calling_code,
        region_code=region_code,
        possible_number="Yes" if is_possible else "No",
        valid_number="Yes" if is_valid else "No (Invalid numbering plan)",
        international_format=intl_format,
        national_format=nat_format,
        e164_format=e164_format,
        general_area=area_desc if area_desc else "Not available",
        carrier_metadata=carrier_name,
        timezones=tz_str,
        maps_url=maps_url,
        city=city_val,
        name="Not available (Subscriber identity is confidential & protected under ITU-T CPNI standards)",
        live_location="Not available (Cellular networks do not expose GPS; requires device consent via 'GPS my-location')",
        note=(
            "Carrier information may be outdated, particularly after mobile number portability (MNP). "
            "A valid numbering plan does not prove that a number is active or belongs to a particular person."
        )
    )


def _resolve_india_telecom_circle(national_digits: str) -> str:
    """Resolve Indian mobile series to telecom licensed service area (LSA)."""
    if len(national_digits) >= 4:
        s4 = national_digits[:4]
        if s4.startswith("9876") or s4.startswith("9872") or s4.startswith("9888"):
            return "Punjab & Chandigarh"
        if s4.startswith("9810") or s4.startswith("9811") or s4.startswith("9871") or s4.startswith("9818"):
            return "Delhi / NCR"
        if s4.startswith("9820") or s4.startswith("9821") or s4.startswith("9869"):
            return "Mumbai Metro"
        if s4.startswith("9830") or s4.startswith("9831") or s4.startswith("9832"):
            return "Kolkata Metro"
        if s4.startswith("9840") or s4.startswith("9841"):
            return "Chennai Metro"
        if s4.startswith("9845") or s4.startswith("9844"):
            return "Karnataka (Bangalore)"
        if s4.startswith("9849") or s4.startswith("9848"):
            return "Andhra Pradesh & Telangana"
        if s4.startswith("9890") or s4.startswith("9822"):
            return "Maharashtra & Goa"
        if s4.startswith("9896") or s4.startswith("9812"):
            return "Haryana"
    return "National India Telecom LSA"


def _basic_fallback_lookup(raw_cleaned: str, default_region: Optional[str]) -> PhoneLookupResult:
    """Basic fallback parser when phonenumbers package is absent."""
    region = (default_region or "UNKNOWN").upper()
    calling_code = "Not available"
    if raw_cleaned.startswith("+91") or region == "IN":
        calling_code = "+91"
        region = "IN"
        area = "India"
    elif raw_cleaned.startswith("+1") or region == "US":
        calling_code = "+1"
        region = "US"
        area = "United States"
    elif raw_cleaned.startswith("+44") or region == "GB":
        calling_code = "+44"
        region = "GB"
        area = "United Kingdom"
    else:
        area = "Not available"

    international_fmt = raw_cleaned if raw_cleaned.startswith("+") else (f"{calling_code} {raw_cleaned}" if calling_code != "Not available" else raw_cleaned)
    e164_fmt = raw_cleaned if raw_cleaned.startswith("+") else (f"{calling_code}{raw_cleaned.lstrip('0')}" if calling_code != "Not available" else raw_cleaned)

    return PhoneLookupResult(
        entered_number=raw_cleaned,
        country_calling_code=calling_code,
        region_code=region,
        possible_number="Yes" if len(raw_cleaned) >= 7 else "No",
        valid_number="Yes" if len(raw_cleaned) >= 8 else "No",
        international_format=international_fmt,
        national_format=raw_cleaned,
        e164_format=e164_fmt,
        general_area=area,
        carrier_metadata="Not available (Install requirements.txt)",
        timezones="Not available",
        maps_url=build_area_search_url(area)
    )
