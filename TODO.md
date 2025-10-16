# TODO: Change and Add Images for Toys

## Steps to Complete

1. **Identify Images to Change or Add**
   - Review toys.json to select which existing toy images to update.
   - Determine new toys to add with images (specify names, ages, etc. if adding new).

2. **Handle Local Images**
   - If using local images from machine:
     - Copy image files to public/toys/ directory.
     - Update toys.json "image" field with local path like "/toys/new-image.jpg".

3. **Handle Google Images**
   - Search for images on Google using browser_action tool.
   - Download selected images.
   - Upload to Cloudinary using lib/cloudinary.js.
   - Get the Cloudinary URL and update toys.json "image" field.

4. **Edit toys.json**
   - For changes: Replace "image" URLs in existing toy objects.
   - For additions: Append new toy objects with all required fields including "image".

5. **Test Changes**
   - Run the app locally to verify images display correctly in ToysSection component.
   - Check for any errors in console or rendering issues.

## Notes
- Ensure image URLs are valid and accessible.
- For Cloudinary uploads, use the existing lib/cloudinary.js integration.
- Backup toys.json before editing.
