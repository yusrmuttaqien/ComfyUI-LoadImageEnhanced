# ComfyUI LoadImageEnhanced

This custom node extends ComfyUI's image loading functionality with filename output and original filename tracking.

## Features

### LoadImageEnhanced
- **Enhanced Load Image Node**: Based on the original ComfyUI LoadImage node
- **Compatible**: Maintains all original functionality (IMAGE and MASK outputs)
- **Filename Output**: Returns the filename of the loaded image as a STRING output
- **Original Filename Tracking**: Preserves the original filename even when the image is modified by tools like MaskEditor
- **Multi-frame Support**: Supports animated images (e.g., GIFs) with multi-frame iteration
- **EXIF Handling**: Automatically applies EXIF orientation rotation
- **Subfolder Listing**: Recursively lists images from subfolders (excludes `clipspace`, `3d`, `pasted`, and any folder/file starting with `.`)

## Installation

1. Place `nodes.py` in your ComfyUI `custom_nodes` directory
2. Restart ComfyUI
3. The new node will appear in the "image" category

## Usage

### LoadImageEnhanced
- **Input**: Select an image file from the dropdown (includes images from subfolders)
- **Inputs**:
  - `image` — Image filename to load
  - `original_filename` — Text field that stores the original selected filename (editable by user)
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

### Filename Tracking

The `filename` output uses the value of the `original_filename` widget. This widget is automatically updated when you select a new image from the dropdown, but is **not** changed by downstream tools like MaskEditor. This means:

- When you first select an image (e.g., `characters/hero.png`), the filename output is `hero.png`
- If MaskEditor saves the edited image to `clipspace-painted-xxx.png`, the dropdown updates but the `original_filename` widget stays as `hero.png`
- The filename output continues to return `hero.png` even after mask edits

### Frontend Extension (Automatic)

The node includes a frontend extension that automatically syncs the `original_filename` widget when you change the dropdown. It's bundled with the custom node and loads automatically via `WEB_DIRECTORY`.

Without the extension, the `original_filename` field is still available but must be manually edited.

- The node recursively lists all images in the input folder and its subfolders
- Images inside `clipspace`, `3d`, `pasted`, and any hidden (starting with `.`) folders are excluded from the **dropdown listing**
- Any file starting with `.` (e.g., `.DS_Store`) is also excluded from the listing
- However, if a downstream node (e.g., mask editor) passes an image path from an excluded folder, the node will still load it correctly
- Images with multiple frames (e.g., animated GIFs) are processed frame-by-frame and concatenated
- If no alpha channel is found in an image, a default 64x64 mask is returned
- The node automatically handles EXIF orientation for proper image display
- Error messages are printed to console for any files that fail to load

## Based On

- [ComfyUI LoadImage Node](https://github.com/comfyanonymous/ComfyUI/blob/master/nodes.py)
