"""Google Maps link generation module for GPS."""
import urllib.parse


def build_area_search_url(area_query: str) -> str:
    """Generate a valid Google Maps search URL for general-area metadata.
    
    Args:
        area_query: General geographic description or country name.
        
    Returns:
        Formatted Google Maps search URL.
    """
    if not area_query or area_query.strip() == "" or area_query == "Not available":
        return "Not available"
    encoded_query = urllib.parse.quote(area_query.strip())
    return f"https://www.google.com/maps/search/?api=1&query={encoded_query}"


def build_coordinates_url(latitude: float, longitude: float) -> str:
    """Generate an official Google Maps URL for permission-approved coordinates.
    
    Format:
        https://www.google.com/maps/search/?api=1&query=LATITUDE%2CLONGITUDE
        
    Args:
        latitude: Latitude coordinate (-90.0 to 90.0).
        longitude: Longitude coordinate (-180.0 to 180.0).
        
    Returns:
        Formatted Google Maps coordinate URL.
    """
    coord_str = f"{latitude},{longitude}"
    encoded_coords = urllib.parse.quote(coord_str)
    return f"https://www.google.com/maps/search/?api=1&query={encoded_coords}"
