import fs from 'fs/promises';
import path from 'path';

const launchersDir = path.resolve(process.cwd(), 'backend/data/launchers');
const gamesJsonPath = path.resolve(process.cwd(), 'backend/data/games.json');
const manifestPath = path.resolve(process.cwd(), 'frontend/public/games/redtiger/games-manifest.json');

async function generateManifest() {
  try {
    const gamesData = JSON.parse(await fs.readFile(gamesJsonPath, 'utf-8'));
    const launcherFiles = await fs.readdir(launchersDir);

    const games = [];

    for (const file of launcherFiles) {
      if (path.extname(file) === '.html') {
        const id = path.basename(file, '.html');
        const filePath = path.join(launchersDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        const gameIdMatch = content.match(/gameId:\s*'([^']+)'/);
        const gameAppIdMatch = content.match(/gameAppId:\s*'([^']+)'/);
        const hasGambleMatch = content.match(/hasGamble:\s*(true|false)/);

        if (gameIdMatch && gameAppIdMatch && hasGambleMatch) {
          const gameId = gameIdMatch[1];
          const gameAppId = gameAppIdMatch[1];
          const hasGamble = hasGambleMatch[1] === 'true';

          const gameInfo = gamesData.find(g => g.launcher_link?.endsWith(gameAppId) || g.launcher_link?.endsWith(gameId));

          games.push({
            id: id,
            name: gameInfo ? gameInfo.name : id.replace(/-/g, ' '),
            provider: 'redtiger',
            config: {
              gameId,
              gameAppId,
              hasGamble,
            },
          });
        }
      }
    }

    const manifest = { games };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`Manifest generated at ${manifestPath}`);
  } catch (error) {
    console.error('Error generating manifest:', error);
  }
}

generateManifest();
