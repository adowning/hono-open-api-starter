import { program } from './root';
import * as game from './stubs/game';
import { Cfg } from './stubs/config';
import * as startup from './startup';
import { ToID } from './stubs/util';

const scanCmd = program.command('scan')
    .alias('calc')
    .description('Slots games reels scanning\nCalculate RTP (Return to Player) percentage for specified slot game reels.')
    .requiredOption('-g, --game <games...>', 'identifier of game to scan')
    .option<number>('-r, --mrtp <number>', 'master RTP to calculate nearest reels', (val) => parseFloat(val), Cfg.DefMRTP)
    .option<number>('--mc <number>', 'Monte Carlo method samples number, in millions', (val) => parseInt(val, 10))
    .option<number>('--mcp <number>', 'Precision of result for Monte Carlo method, in percents', (val) => parseFloat(val))
    .option<number>('--mt <number>', 'multithreaded scanning threads number', (val) => parseInt(val, 10));

scanCmd.action((options) => {
    const exitctx = startup.Startup();

    // In the original Go code, these flags would modify the cfg object directly.
    // Here, we can pass them along or update a shared config object if needed.
    if (options.mc) Cfg.MCCount = options.mc;
    if (options.mcp) Cfg.MCPrec = options.mcp;
    if (options.mt) Cfg.MTCount = options.mt;

    const list: string[] = options.game;
    for (const alias of list) {
        const scanId = ToID(alias); // Assuming ToID is available from stubs
        const scan = game.ScanFactory[scanId];
        if (!scan) {
            console.error(`Error: game name "${alias}" does not recognized`);
            process.exit(1);
        }
        if (scan === null) {
            console.log(`\n***Scanner for '${alias}' game is absent***`);
        } else {
            if (list.length > 1) {
                console.log(`\n***Scan '${alias}' game with master RTP ${options.mrtp}***`);
            }
            scan(exitctx, options.mrtp);
        }
    }
});

scanCmd.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log(`  $ ${Cfg.AppName} scan --game=megajack/slotopol --mrtp=100`);
    console.log(`  $ ${Cfg.AppName} scan -g="Novomatic / Dolphins Pearl" -g=novomatic/katana -r=94.5`);
});
