import { describe, it, expect } from 'vitest';
import crypto from './crypto.js';

describe('Crypto Module', () => {
    it('should encrypt and decrypt a simple string successfully', () => {
        const key = 'my-secret-key';
        const plaintext = 'This is a test message.';
        
        const encrypted = crypto.encrypt(key, plaintext);
        const decrypted = crypto.decrypt(key, encrypted);
        
        expect(decrypted).toBe(plaintext);
    });

    it('should handle UTF-8 characters correctly', () => {
        const key = 'another-secret';
        const plaintext = '你好,世界！🌍'; // "Hello, World!" in Chinese with an emoji
        
        const encrypted = crypto.encrypt(key, plaintext);
        const decrypted = crypto.decrypt(key, encrypted);
        
        expect(decrypted).toBe(plaintext);
    });

    it('should fail decryption with an incorrect key', () => {
        const key = 'correct-key';
        const wrongKey = 'wrong-key';
        const plaintext = 'This should not be revealed.';
        
        const encrypted = crypto.encrypt(key, plaintext);
        
        // Expecting the decrypt function to throw a URIError because the
        // resulting byte stream will not be valid UTF-8.
        expect(() => {
            crypto.decrypt(wrongKey, encrypted);
        }).toThrow(URIError);
    });

    it('should produce different results with corrupted ciphertext', () => {
        const key = 'a-good-key';
        const plaintext = 'Some important data.';
        
        const encrypted = crypto.encrypt(key, plaintext);
        const corruptedEncrypted = '00' + encrypted.slice(2); // Alter the first byte
        
        const decrypted = crypto.decrypt(key, corruptedEncrypted);

        expect(decrypted).not.toBe(plaintext);
    });
});
