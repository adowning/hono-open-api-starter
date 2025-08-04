import path from 'path';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs/promises';

let imageDirectory = path.join(__dirname, '.');

// --- Helper Function ---
function sanitizeFilename(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^a-z0-9_.-]/g, ''); // Remove any other invalid characters except dots and hyphens for extensions
}

// --- Main Script ---
async function processAndRenameImages() {
  try {
    let client = new ImageAnnotatorClient();
    let files = await fs.readdir(imageDirectory);

    console.log(`Found ${files.length} images to process...`);

    for (let file of files) {
      let oldFilePath = path.join(imageDirectory, file);
      let fileExtension = path.extname(file);

      try {
        let [result] = await client.textDetection(oldFilePath);
        let detections = result.textAnnotations;

        if (detections && detections.length > 0 && detections[0].description) {
          let fullText = detections[0].description.replace(/\n/g, ' ').trim();
          let newFileNameBase = sanitizeFilename(fullText);

          if (newFileNameBase) {
            let newFileName = `${newFileNameBase}${fileExtension}`;
            let newFilePath = path.join(imageDirectory, newFileName);

            // Check if new file name already exists to avoid overwriting
            try {
              await fs.access(newFilePath);
              console.log(`Skipping rename for "${file}": "${newFileName}" already exists.`);
            } catch (e) {
              // File does not exist, proceed with rename
              await fs.rename(oldFilePath, newFilePath);
              console.log(`Renamed "${file}" to "${newFileName}"`);
            }
          } else {
            console.log(`Skipping rename for "${file}": No valid text found.`);
          }
        } else {
          console.log(`Skipping rename for "${file}": No text detected.`);
        }
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  } catch (err) {
    console.error('Failed to initialize Google Cloud Vision client or read directory:', err);
    console.error('Please ensure you are authenticated and the image directory is correct.');
  }
}

processAndRenameImages();