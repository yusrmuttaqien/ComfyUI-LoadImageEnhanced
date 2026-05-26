# ComfyUI LoadImageEnhanced

This custom node extends ComfyUI's image loading functionality with filename output.

## Features

### LoadImageEnhanced
- **Enhanced Load Image Node**: Based on the original ComfyUI LoadImage node
- **Filename Output**: Returns the filename of the loaded image as a STRING output
- **Compatible**: Maintains all original functionality (IMAGE and MASK outputs)
- **Multi-frame Support**: Supports animated images (e.g., GIFs) with multi-frame iteration
- **EXIF Handling**: Automatically applies EXIF orientation rotation
- **Subfolder Listing**: Recursively lists images from subfolders (excludes `clipspace`, `3d`, `pasted`, and any folder/file starting with `.`)
- **Original Filename Preservation**: The filename output remembers the original dropdown selection even when the image is re-saved to a different path (e.g., by MaskEditor)

## Installation

1. Place `nodes.py` in your ComfyUI `custom_nodes` directory
2. Restart ComfyUI
3. The new node will appear in the "image" category

## Usage

### LoadImageEnhanced
- **Input**: Select an image file from the dropdown (includes images from subfolders)
- **Outputs**:
  - `image`: The loaded image tensor
  - `mask`: The image mask (if available)
  - `filename`: The filename of the loaded image

## Requirements

- ComfyUI
- PIL (Pillow)
- PyTorch
- NumPy

## Notes

- The node recursively lists all images in the input folder and its subfolders
- Images inside `clipspace`, `3d`, `pasted`, and any hidden (starting with `.`) folders are excluded from the **dropdown listing**
- Any file starting with `.` (e.g., `.DS_Store`) is also excluded from the listing
- However, if a downstream node (e.g., mask editor) passes an image path from an excluded folder, the node will still load it correctly
- The filename output preserves the original dropdown selection even when the image is re-saved to a different path by tools like MaskEditor
- Images with multiple frames (e.g., animated GIFs) are processed frame-by-frame and concatenated
- If no alpha channel is found in an image, a default 64x64 mask is returned
- The node automatically handles EXIF orientation for proper image display
- Error messages are printed to console for any files that fail to load

## Based On

- [ComfyUI LoadImage Node](https://github.com/comfyanonymous/ComfyUI/blob/master/nodes.py)