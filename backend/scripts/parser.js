const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * This script parses an HTML file to extract game information.
 * It reads the specified HTML file, finds all game cards, and extracts
 * the game name, image URL, and a demo launcher link for each game.
 * The extracted data is then saved to a specified JSON file.
 *
 * @param {string} inputPath - The absolute path to the HTML file to parse.
 * @param {string} outputPath - The absolute path to save the output JSON file.
 */
function parseGamesFromHtml(inputPath, outputPath) {
  try {
    // 1. Read the HTML file
    const html = fs.readFileSync(inputPath, 'utf-8');

    // 2. Load the HTML into cheerio for easy traversal
    const $ = cheerio.load(html);
      games.push(gameData);
    });

    // 5. Save the data as a nicely formatted JSON string to a file
    const jsonData = JSON.stringify(games, null, 2);
    fs.writeFileSync(outputPath, jsonData, 'utf-8');
    console.log(`✅ Successfully parsed ${games.length} games and saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error processing file at ${inputPath}:`, error);
  }
}

// --- Configuration ---
const inputFilePath = '/home/ash/Documents/hono-open-api-starter/x.html';

// Define the output directory and ensure it exists
const outputDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outputFilePath = path.join(outputDir, 'games.json');

// --- Execution ---
parseGamesFromHtml(inputFilePath, outputFilePath);

