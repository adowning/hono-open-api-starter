import { program } from './root';
import * as game from './stubs/game';
import { Cfg } from './stubs/config';
import { GameInfo } from './stubs/game';

// Helper function to format game info, similar to the Go version.
function formatGameInfo(gi: GameInfo, options: any): string {
    let s = '';
    if (gi.SN > 0) {
        if (gi.GP & game.GPcasc) {
            s += `'${gi.Name}' ${gi.Prov} ${gi.SX}x${gi.SY} cascade videoslot`;
        } else {
            s += `'${gi.Name}' ${gi.Prov} ${gi.SX}x${gi.SY} videoslot`;
        }
    } else {
        s += `'${gi.Name}' ${gi.Prov} ${gi.SX} spots lottery`;
    }

    if (options.prop) {
        // Add more properties based on flags...
        if (gi.SN > 0) s += `, ${gi.SN} symbols`;
        if (gi.LN > 0) s += `, ${gi.LN} lines`;
        if (gi.WN > 0) s += `, ${gi.WN} ways`;
        if (gi.GP & game.GPjack) s += `, has jackpot`;
    }

    if (options.rtp && gi.RTP.length > 0) {
        s += `, RTP: ${gi.RTP.map(r => r.toFixed(2)).join(', ')}`;
    }
    if (options.mrtp && gi.RTP.length > 0) {
        const closestRtp = gi.FindClosest(options.mrtp);
        s += `, mrtp(${options.mrtp})=${closestRtp}`;
    }
    if (options.diff && gi.RTP.length > 0) {
        const diff = gi.FindClosest(options.diff) - options.diff;
        s += `, diff(${options.diff})=${diff.toPrecision(6)}`;
    }

    return s;
}

const listCmd = program.command('list')
    .description('List of available games released on server')
    .option('-n, --no-name', 'suppress listing of provided games names')
    .option('-t, --no-stat', 'suppress summary statistics of provided games')
    .option('-s, --sort', 'sort by provider, else sort by names', false)
    .option('-p, --prop', 'print properties for each game', false)
    .option('-r, --rtp', 'RTP (Return to Player) percents list of available reels for each game', false)
    .option('--mrtp <number>', 'RTP (Return to Player) of reels closest to given master RTP', parseFloat)
    .option('--diff <number>', 'difference between master RTP and closest to it real reels RTP', parseFloat)
    .option('-i, --include <filter...>', 'filter(s) to include games', ['all'])
    .option('-e, --exclude <filter...>', 'filter(s) to exclude games', [])
    .action((options) => {
        const finclist = (options.include || []).map(game.GetFilter).filter((f: game.Filter | null): f is game.Filter => f !== null);
        const fexclist = (options.exclude || []).map(game.GetFilter).filter((f: game.Filter | null): f is game.Filter => f !== null);

        const gamelist = Object.values(game.InfoMap).filter(gi => game.Passes(gi, finclist, fexclist));

        if (options.name) {
            console.log('');
            gamelist.sort((a, b) => {
                if (options.sort) { // sort by provider
                    if (a.Prov === b.Prov) return a.Name.localeCompare(b.Name);
                    return a.Prov.localeCompare(b.Prov);
                } else { // sort by name
                    if (a.Name === b.Name) return a.Prov.localeCompare(b.Prov);
                    return a.Name.localeCompare(b.Name);
                }
            });
            gamelist.forEach(gi => console.log(formatGameInfo(gi, options)));
        }

        if (options.stat) {
            const provStats: { [key: string]: number } = {};
            gamelist.forEach(gi => {
                provStats[gi.Prov] = (provStats[gi.Prov] || 0) + 1;
            });
            const algCount = new Set(gamelist.map(gi => gi.AlgDescr)).size;

            console.log('');
            console.log(`total: ${gamelist.length} games, ${algCount} algorithms, ${Object.keys(provStats).length} providers`);
            Object.keys(provStats).sort().forEach(p => {
                console.log(`${p}: ${provStats[p]} games`);
            });
        }
    });

listCmd.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log(`  $ ${Cfg.AppName} list`);
    console.log(`  $ ${Cfg.AppName} list -i casc`);
    console.log(`  $ ${Cfg.AppName} list -i netent -i betsoft`);
    console.log(`  $ ${Cfg.AppName} list -i 3x3 -e agt`);
    console.log(`  $ ${Cfg.AppName} list -i playngo --rtp`);
});
