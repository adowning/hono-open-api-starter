/**
 * This module provides simple encryption and decryption functionalities
 * using the RC4 stream cipher.
 *
 * WARNING: RC4 is considered cryptographically insecure and should not be
 * used for sensitive data. It is provided here for compatibility or
 * educational purposes only.
 */
'use strict'

const HEX_CHARS = '0123456789abcdef'

/**
 * Converts a hexadecimal string into an array of bytes.
 * @param {string} hexString - The hexadecimal string to convert.
 * @returns {number[]} An array of bytes.
 */
function hexStringToByteArray(hexString) {
    if (typeof hexString !== 'string') {
        return []
    }
    const bytes = []
    for (let i = 0; i < hexString.length; i += 2) {
        const high = HEX_CHARS.indexOf(hexString[i])
        const low = HEX_CHARS.indexOf(hexString[i + 1])
        bytes.push((high << 4) | low)
    }
    return bytes
}

/**
 * Converts an array of bytes into a hexadecimal string.
 * @param {number[]} byteArray - The array of bytes to convert.
 * @returns {string} The resulting hexadecimal string.
 */
function byteArrayToHexString(byteArray) {
    const hexChars = []
    byteArray.forEach(byte => {
        hexChars.push(HEX_CHARS.charAt((byte >> 4) & 0x0F))
        hexChars.push(HEX_CHARS.charAt(byte & 0x0F))
    })
    return hexChars.join('')
}

/**
 * Converts a UTF-8 string into an array of bytes.
 * Handles URI encoding to correctly represent multi-byte characters.
 * @param {string} str - The string to convert.
 * @returns {number[]} An array of bytes.
 */
function stringToByteArray(str) {
    const uriEncoded = encodeURIComponent(str)
    const bytes = []
    for (let i = 0; i < uriEncoded.length; i++) {
        const char = uriEncoded[i]
        if (char === '%') {
            const high = HEX_CHARS.indexOf(uriEncoded[i + 1].toLowerCase())
            const low = HEX_CHARS.indexOf(uriEncoded[i + 2].toLowerCase())
            bytes.push((high << 4) | low)
            i += 2
        } else {
            bytes.push(char.charCodeAt(0))
        }
    }
    return bytes
}

/**
 * Converts an array of bytes into a UTF-8 string.
 * @param {number[]} byteArray - The array of bytes to convert.
 * @returns {string} The resulting UTF-8 string.
 */
function byteArrayToString(byteArray) {
    let uriEncoded = ''
    for (const byte of byteArray) {
        uriEncoded += `%${HEX_CHARS.charAt((byte >> 4) & 0x0F)}${HEX_CHARS.charAt(byte & 0x0F)}`
    }
    // If the byte sequence is not valid UTF-8, this will throw a URIError.
    // This is the desired behavior, as it indicates an issue with the
    // key or the ciphertext.
    return decodeURIComponent(uriEncoded)
}

/**
 * Implements the RC4 stream cipher algorithm.
 * It performs the same operation for both encryption and decryption.
 * @param {number[]} key - The key as an array of bytes.
 * @param {number[]} data - The data to process as an array of bytes.
 * @returns {number[]} The processed (encrypted or decrypted) data as an array of bytes.
 */
function rc4(key, data) {
    // Key-Scheduling Algorithm (KSA)
    const sBox = []
    for (let i = 0; i < 256; i++) {
        sBox[i] = i
    }

    let j = 0
    for (let i = 0; i < 256; i++) {
        j = (j + sBox[i] + key[i % key.length]) % 256;
        // Swap sBox[i] and sBox[j]
        [sBox[i], sBox[j]] = [sBox[j], sBox[i]]
    }

    // Pseudo-Random Generation Algorithm (PRGA)
    let i = 0
    j = 0
    const result = []
    for (const charCode of data) {
        i = (i + 1) % 256
        j = (j + sBox[i]) % 256;
        // Swap sBox[i] and sBox[j]
        [sBox[i], sBox[j]] = [sBox[j], sBox[i]]
        const keyStreamChar = sBox[(sBox[i] + sBox[j]) % 256]
        result.push(charCode ^ keyStreamChar)
    }
    return result
}

const cryptoApi = {
    /**
     * Encrypts a plaintext string using a key.
     * @param {string} key - The encryption key.
     * @param {string} plaintext - The string to encrypt.
     * @returns {string} The encrypted string in hexadecimal format.
     */
    encrypt(key, plaintext) {
        const keyBytes = stringToByteArray(key)
        const plaintextBytes = stringToByteArray(plaintext)
        const encryptedBytes = rc4(keyBytes, plaintextBytes)
        return byteArrayToHexString(encryptedBytes)
    },

    /**
     * Decrypts a hexadecimal ciphertext string using a key.
     * @param {string} key - The decryption key.
     * @param {string} ciphertext - The hexadecimal string to decrypt.
     * @returns {string} The decrypted plaintext string.
     */
    decrypt(key, ciphertext) {
        const keyBytes = stringToByteArray(key)
        const ciphertextBytes = hexStringToByteArray(ciphertext)
        const decryptedBytes = rc4(keyBytes, ciphertextBytes)
        return byteArrayToString(decryptedBytes)
    }
}

module.exports = cryptoApi
