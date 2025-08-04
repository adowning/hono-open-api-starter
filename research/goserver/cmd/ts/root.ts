import { Command } from 'commander';
import { Cfg, InitConfig } from './stubs/config';

export const program = new Command();

program
    .name(Cfg.AppName)
    .version(`version: ${Cfg.BuildVers}, builton: ${Cfg.BuildTime}`)
    .description('Slots games backend\nThis application implements web server and reels scanner for slots games.')
    .option('-c, --config <file>', 'config file (default is config/slot-app.yaml at executable location)')
    .option('-q, --sqlite <path>', 'sqlite databases path (default same as config file path)')
    .option('-d, --devmode', 'start application in developer mode');

program.on('option:config', (file) => {
    Cfg.CfgFile = file;
});
program.on('option:sqlite', (path) => {
    Cfg.SqlPath = path;
});
program.on('option:devmode', () => {
    Cfg.DevMode = true;
});

// `preAction` hook is a good place for initialization logic that runs before any command's action.
program.hook('preAction', (thisCommand, actionCommand) => {
    console.log('Executing command: %s', actionCommand.name());
    InitConfig();
});

// The `Execute` function from cobra is analogous to calling `program.parse()`
// which will be done in the main.ts file.
export const Execute = async () => {
    // Subcommands should be added before parsing.
    await program.parseAsync(process.argv);
};
