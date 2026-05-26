import os
import hashlib
import torch
import numpy as np
from PIL import Image, ImageOps, ImageSequence
from PIL.PngImagePlugin import PngInfo
import folder_paths
import node_helpers


EXCLUDED_FOLDERS = {"clipspace", "3d", "pasted"}


def _collect_images_recursive(input_dir):
    """Recursively collect image files from input directory, excluding certain subfolders."""
    image_files = []
    for root, dirs, files in os.walk(input_dir):
        # Filter out excluded directories in-place so os.walk skips them
        dirs[:] = [d for d in dirs if d not in EXCLUDED_FOLDERS]

        for filename in files:
            filepath = os.path.join(root, filename)
            # Create relative path from input_dir root
            rel_path = os.path.relpath(filepath, input_dir)
            image_files.append(rel_path)

    return image_files


class LoadImageEnhanced:
    @classmethod
    def INPUT_TYPES(s):
        input_dir = folder_paths.get_input_directory()
        all_files = _collect_images_recursive(input_dir)
        # Filter for image content types
        filtered_files = folder_paths.filter_files_content_types(all_files, ["image"])
        return {"required":
                    {"image": (sorted(filtered_files), {"image_upload": True})},
                }

    CATEGORY = "image"

    RETURN_TYPES = ("IMAGE", "MASK", "STRING")
    RETURN_NAMES = ("image", "mask", "filename")
    FUNCTION = "load_image"

    def load_image(self, image):
        input_dir = folder_paths.get_input_directory()
        image_path = os.path.join(input_dir, image)

        img = node_helpers.pillow(Image.open, image_path)

        output_images = []
        output_masks = []
        w, h = None, None

        excluded_formats = ['MPO']

        for i in ImageSequence.Iterator(img):
            i = node_helpers.pillow(ImageOps.exif_transpose, i)

            if i.mode == 'I':
                i = i.point(lambda i: i * (1 / 255))
            image = i.convert("RGB")

            if len(output_images) == 0:
                w = image.size[0]
                h = image.size[1]

            if image.size[0] != w or image.size[1] != h:
                continue

            image = np.array(image).astype(np.float32) / 255.0
            image = torch.from_numpy(image)[None,]
            if 'A' in i.getbands():
                mask = np.array(i.getchannel('A')).astype(np.float32) / 255.0
                mask = 1. - torch.from_numpy(mask)
            elif i.mode == 'P' and 'transparency' in i.info:
                mask = np.array(i.convert('RGBA').getchannel('A')).astype(np.float32) / 255.0
                mask = 1. - torch.from_numpy(mask)
            else:
                mask = torch.zeros((64,64), dtype=torch.float32, device="cpu")
            output_images.append(image)
            output_masks.append(mask.unsqueeze(0))

        if len(output_images) > 1 and img.format not in excluded_formats:
            output_image = torch.cat(output_images, dim=0)
            output_mask = torch.cat(output_masks, dim=0)
        else:
            output_image = output_images[0]
            output_mask = output_masks[0]

        # Extract filename from the image path
        filename = os.path.basename(image_path)

        return (output_image, output_mask, filename)

    @classmethod
    def IS_CHANGED(s, image):
        image_path = folder_paths.get_annotated_filepath(image)
        m = hashlib.sha256()
        with open(image_path, 'rb') as f:
            m.update(f.read())
        return m.digest().hex()

    @classmethod
    def VALIDATE_INPUTS(s, image):
        if not folder_paths.exists_annotated_filepath(image):
            return "Invalid image file: {}".format(image)

        return True