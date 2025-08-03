import { rc4Api } from '../src/lzw';
// import { lzwDecode } from '../src/lzw';
import fs from 'fs';
import path from 'path';

const lzwDecode =  (t) => {
    const e = {}
                            let i = (t = t.substr(4)).substr(0, 1),
                                n = i,
                                s = 256;
                            const o = [i];
                            for (let r = 1; r < t.length; r++) {
                                const a = t.charCodeAt(r);
                                let l;
                                l = a < 256 ? t.substr(r, 1) : e[a] ? e[a] : n + i, o.push(l), i = l.substr(0, 1), e[s] = n + i, s++, n = l
                            }
                            // if (JSON.parse(o.join("")).game) {
                            //     if (JSON.parse(o.join("")).game.totalSpinWinnings) {
                            //         if (JSON.parse(o.join("")).game.totalSpinWinnings > 0) {
                            //             const coins = JSON.parse(o.join("")).game.totalSpinWinnings * 100
                            //             // window.parent.supabase.rpc('nolimit_increment_coins', { row_id: window.parent.userId, val: coins }).then((data, error) => {
                            //             //     console.log(error)
                            //             //     console.log(data)
                            //             //     window.top.postMessage('nolimit_increment_coins', '*')
                            //             // })
                            //         }
                            //     }
                            // }
                            console.log(o)

                            return o.join("")

                        }
try {
    // 1. Read the key and message from files.
    const key = fs.readFileSync(path.join(__dirname, 'key.txt'), 'utf-8');
    const rawMessageFromServer = fs.readFileSync(path.join(__dirname, 'message.txt'), 'utf-8');
    console.log(lzwDecode(rawMessageFromServer))
    // 2. Decrypt the raw message from the server.
    const decryptedData = rc4Api.decryptRaw(key, rawMessageFromServer);
    console.log('--- Decrypted Data (before LZW decompression) ---');
    console.log(decryptedData);

    // 3. Decompress the decrypted data using LZW.
    const decompressedData = lzwDecode(decryptedData);
    console.log('\n--- Final Decompressed and Decrypted Data ---');
    console.log(decompressedData);

    // 4. As a final verification, let's parse the JSON.
    if (decompressedData.startsWith('lzw:')) {
        throw new Error("Decompression failed, 'lzw:' prefix is still present.");
    }
    const jsonData = JSON.parse(lzwDecode(rawMessageFromServer));
    console.log('\n--- Parsed JSON Object ---');
    console.log(jsonData);

} catch (error) {
    console.error('\n--- An error occurred during the process ---');
    console.error(error);
}
