#!/usr/bin/env node

import { program } from './root';

// Import the command files to ensure they are registered with the program.
import './list';
import './scan';
import './web';

// This is the main entry point of the application.
async function main() {
    try {
        // `parseAsync` will handle parsing `process.argv`, executing the appropriate command,
        // and catching any errors during command processing.
        await program.parseAsync(process.argv);
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        process.exit(1);
    }
}

// Run the main function.
main();
