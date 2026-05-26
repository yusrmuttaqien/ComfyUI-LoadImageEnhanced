from .nodes import LoadImageEnhanced

WEB_DIRECTORY = "./js"

NODE_CLASS_MAPPINGS = {
    "LoadImageEnhanced": LoadImageEnhanced,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LoadImageEnhanced": "Load Image Enhanced",
}

__all__ = [
    "NODE_CLASS_MAPPINGS",
    "NODE_DISPLAY_NAME_MAPPINGS",
    "WEB_DIRECTORY",
]