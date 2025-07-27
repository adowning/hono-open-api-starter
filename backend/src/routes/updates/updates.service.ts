/* eslint-disable node/prefer-global/buffer */

import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import rclone from 'rclone.js'

import type { AppVersion, UpdateMetadata, UpdateTypeZ } from '#/db/schema'

import env from '#/env'

// --- Configuration ---
const isProduction = env.NODE_ENV === 'production'
const UPDATES_DIR = join(process.cwd(), 'updates') // Still used for local dev
const METADATA_FILE = join(UPDATES_DIR, 'metadata.json')
const R2_REMOTE_NAME = env.RCLONE_R2_REMOTE || 'cloudflare' // The name of your configured rclone remote
const R2_BUCKET_NAME = env.R2_BUCKET_NAME || 'apkfiles'

// Ensure the updates directory exists on startup
;(async () => {
    if (!existsSync(UPDATES_DIR)) {
        await mkdir(UPDATES_DIR, { recursive: true })
    }
})()

// --- Metadata Management (No changes) ---
export async function loadMetadata(): Promise<UpdateMetadata> {
    try {
        if (existsSync(METADATA_FILE)) {
            const content = await readFile(METADATA_FILE, 'utf-8')
            return JSON.parse(content)
        }
    } catch (error) {
        console.error('Failed to load metadata:', error)
    }
    return {}
}

export async function saveMetadata(metadata: UpdateMetadata): Promise<void> {
    try {
        await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2))
    } catch (error) {
        console.error('Failed to save metadata:', error)
    }
}

// --- Version Logic (No changes) ---
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    const len = Math.max(parts1.length, parts2.length)
    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0
        const p2 = parts2[i] || 0
        if (p1 > p2) return 1
        if (p1 < p2) return -1
    }
    return 0
}

export function getLatestVersion(
    versions: AppVersion[],
    type: UpdateTypeZ
): AppVersion | null {
    const filteredVersions = versions.filter((v) => v.updateType === type)
    if (filteredVersions.length === 0) return null

    return filteredVersions.reduce((latest, current) =>
        compareVersions(current.version, latest.version) > 0 ? current : latest
    )
}

// --- File Storage Logic (Refactored for rclone) ---
function getFileExtension(type: UpdateTypeZ): string {
    return type === 'BINARY' ? 'apk' : 'zip'
}

function generateR2Key(
    appId: string,
    platform: string,
    type: UpdateTypeZ,
    version: string
): string {
    const extension = getFileExtension(type)
    return `${appId}/${platform}/${type}/${version}/bundle.${extension}`
}

export function generateDownloadUrl(
    appId: string,
    platform: string,
    type: UpdateTypeZ,
    version: string
): string {
    if (isProduction) {
        if (!env.R2_PUBLIC_URL) {
            console.warn(
                'R2_PUBLIC_URL is not set. Download links may be incorrect.'
            )
            return ''
        }
        const key = generateR2Key(appId, platform, type, version)
        return `${env.R2_PUBLIC_URL}/${key}`
    } else {
        const extension = getFileExtension(type)
        const filename = `${appId}_${platform}_${type}_${version}.${extension}`
        return `/api/updates/download/${filename}` // Local download URL
    }
}

export async function saveUpdateFile(
    file: File,
    appId: string,
    platform: string,
    type: UpdateTypeZ,
    version: string
): Promise<{ buffer: ArrayBuffer }> {
    const buffer = await file.arrayBuffer()
    const body = new Uint8Array(buffer)
    console.log(chalk.white('Saving update file for app:', appId))

    if (isProduction) {
        if (!R2_BUCKET_NAME) {
            throw new Error(
                'R2_BUCKET_NAME environment variable is not set for production.'
            )
        }

        // 1. Write file to a temporary local path
        const tempFilePath = join(tmpdir(), `${appId}-${version}-${file.name}`)
        await writeFile(tempFilePath, body)

        // 2. Define the destination for rclone
        const destination = `${R2_REMOTE_NAME}:${R2_BUCKET_NAME}/${generateR2Key(appId, platform, type, version)}`

        try {
            // 3. Use rclone to copy the file to the R2 remote
            const result = await rclone.copy(tempFilePath, destination)
            console.log('Rclone upload successful:', result)
        } catch (error) {
            console.error('Rclone upload failed:', error)
            throw new Error('Failed to upload file to R2 storage.')
        } finally {
            // 4. Clean up the temporary file from the server
            await unlink(tempFilePath)
        }
    } else {
        // Save locally for development
        const extension = getFileExtension(type)
        const filename = `${appId}_${platform}_${type}_${version}.${extension}`
        const filepath = join(UPDATES_DIR, filename)
        await writeFile(filepath, body)
    }

    return { buffer }
}

export async function getLocalFile(
    filename: string
): Promise<{ file: Buffer; contentType: string } | null> {
    const filepath = join(UPDATES_DIR, filename)
    if (!existsSync(filepath)) {
        return null
    }
    const file = await readFile(filepath)
    const contentType = filename.endsWith('.apk')
        ? 'application/vnd.android.package-archive'
        : 'application/zip'
    return { file, contentType }
}
