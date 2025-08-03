import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates a delay for a specified number of milliseconds.
 * @param {number} ms The number of milliseconds to wait.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Path to games.json, assuming the script is in a `scripts` folder at the project root
const projectRoot = path.resolve(__dirname, '..');
const gamesJsonPath = path.join(projectRoot,  'data', 'games.json');
const outputDir = path.join(projectRoot,  'data', 'launchers');

/**
 * Sanitizes a string to be used as a filename.
 * @param {string} name The string to sanitize.
 * @returns {string} The sanitized filename.
 */
const sanitizeFilename = (name) => {
  return name
    .replace(/™|®|&/g, '') // Remove special characters that are common in game titles
    .replace(/[^a-z0-9\s-]/gi, '') // Remove remaining non-alphanumeric characters except spaces and hyphens
    .trim() // Trim whitespace from ends
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase(); // Convert to lowercase
};

/**
 * Downloads the launcher HTML for a single game.
 * @param {object} game The game object from games.json.
 */
async function downloadLauncher(game) {
  if (!game.launcher_link) {
    console.log(`No launcher_link for: ${game.name}. Skipping.`);
    return;
  }

  try {
    const response = await fetch(game.launcher_link);

    if (!response.ok) {
      console.error(`Failed to download from ${game.launcher_link}. Status: ${response.status} ${response.statusText}`);
      return;
    }

    const rawHtml = await response.text();
    const filename = `${sanitizeFilename(game.name)}.html`;
    const outputPath = path.join(outputDir, filename);

    // Extract only the content within the <body> tag to avoid style conflicts when injected.
    const bodyContentMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const contentToSave = bodyContentMatch ? bodyContentMatch[1].trim() : rawHtml;

    await fs.writeFile(outputPath, contentToSave);
    console.log(`   -> Saved: ${filename}`);
  } catch (error) {
    console.error(`   -> Error for ${game.name}:`, error.message);
  }
}

/**
 * Main function to read games.json and trigger downloads.
 */
async function main() {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Launchers will be saved in: ${outputDir}`);

    const gamesData = await fs.readFile(gamesJsonPath, 'utf-8');
    const games = JSON.parse(gamesData);

    const gamesWithLaunchers = games.filter((game) => game.launcher_link);
    console.log(`Found ${gamesWithLaunchers.length} games with launcher links out of ${games.length} total games. Starting downloads...`);

    // Process downloads sequentially with a delay to avoid being rate-limited.
    let count = 0;
    for (const game of gamesWithLaunchers) {
      count++;
      console.log(`(${count}/${gamesWithLaunchers.length}) Downloading: ${game.name}`);
      await downloadLauncher(game);
      await delay(250); // 250ms delay between each download
    }

    console.log('All launcher downloads have been processed.');
  } catch (error) {
    console.error('An error occurred during the script execution:', error);
    if (error.code === 'ENOENT') {
      console.error(`Could not find games.json at ${gamesJsonPath}. Make sure the path is correct.`);
    }
  }
}

main();