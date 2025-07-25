import type { Context } from "hono";

import * as crypto from "node:crypto";
import { z } from "zod";

import type { AppVersion } from "#/db/schema";

import { AppVersionSchema, CheckUpdateRequestSchema, UpdateTypeSchema } from "#/db/schema";
import env from "#/env";

import * as service from "./updates.service";

export async function handleCheckUpdate(c: Context) {
  try {
    const body = CheckUpdateRequestSchema.safeParse(await c.req.json());
    if (!body.success) {
      return c.json({ error: "Invalid request body" } as const, 400);
    }

    const { currentVersion, platform, appId, updateType } = body.data;

    if (!currentVersion || !platform || !appId || !updateType) {
      return c.json({ error: "Missing required parameters" } as const, 400);
    }

    const metadata = await service.loadMetadata();
    const appVersions = metadata[appId]?.[platform] || [];
    const latestVersion = service.getLatestVersion(appVersions, updateType);

    if (!latestVersion) {
      return c.json({ hasUpdate: false } as const);
    }

    const hasUpdate = (latestVersion.version > currentVersion);

    // Ensure the response matches CheckUpdateResponseSchema
    const response = hasUpdate
      ? {
          hasUpdate: true,
          version: latestVersion.version,
          platform: latestVersion.platform,
          updateType: latestVersion.updateType,
          downloadUrl: latestVersion.downloadUrl,
          changelog: latestVersion.changelog,
          mandatory: latestVersion.mandatory,
          releaseDate: latestVersion.releaseDate,
          fileSize: latestVersion.fileSize,
          checksum: latestVersion.checksum,
        }
      : { hasUpdate: false } as const;

    return c.json(response);
  }
  catch (error) {
    console.error("Error checking for updates:", error);
    return c.json({ error: "Internal server error" } as const, 500);
  }
}
export async function handleUploadUpdate(c: Context) {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");
    const appId = formData.get("appId")?.toString();
    const platform = formData.get("platform")?.toString();
    const version = formData.get("version")?.toString();
    const updateTypeRaw = formData.get("updateType")?.toString();
    const changelogRaw = formData.get("changelog")?.toString() || "[]";
    const mandatoryRaw = formData.get("mandatory")?.toString() === "true";

    // Validate required fields
    if (!(file instanceof File) || !appId || !platform || !version || !updateTypeRaw) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    // Validate update type
    const updateTypeResult = UpdateTypeSchema.safeParse(updateTypeRaw);
    if (!updateTypeResult.success) {
      return c.json({ error: "Invalid update type" }, 400);
    }
    const updateType = updateTypeResult.data;

    // Parse changelog safely
    let changelog: string[] = [];
    try {
      const parsed = JSON.parse(changelogRaw);
      if (Array.isArray(parsed)) {
        changelog = parsed.filter((item: unknown): item is string =>
          typeof item === "string",
        );
      }
    }
    catch {
      console.warn("Failed to parse changelog, using empty array");
    }

    // At this point, all required fields are validated

    const { buffer } = await service.saveUpdateFile(file, appId, platform, updateType, version);
    const checksum = crypto.createHash("sha256").update(new Uint8Array(buffer)).digest("hex");

    const metadata = await service.loadMetadata();
    if (!metadata[appId])
      metadata[appId] = {};
    if (!metadata[appId][platform])
      metadata[appId][platform] = [];

    const newVersion: AppVersion = {
      version,
      platform,
      updateType,
      downloadUrl: service.generateDownloadUrl(appId, platform, updateType, version),
      changelog,
      mandatory: mandatoryRaw,
      releaseDate: new Date().toISOString(),
      fileSize: buffer.byteLength,
      checksum,
    };

    metadata[appId][platform] = metadata[appId][platform].filter((v: any) => !(v.version === version && v.updateType === updateType));
    metadata[appId][platform].push(newVersion);

    await service.saveMetadata(metadata);

    return c.json({
      success: true,
      message: "Update uploaded successfully",
      version: newVersion,
    });
  }
  catch (error) {
    console.error("Error uploading update:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function handleDownloadLocalUpdate(c: Context) {
  // This controller is only for development/local serving
  if (env.NODE_ENV === "production") {
    return c.json({ error: "Not Found" }, 404);
  }
  try {
    const { filename } = c.req.param();
    const result = await service.getLocalFile(filename);

    if (!result) {
      return c.json({ error: "File not found" }, 404);
    }

    return new Response(result.file, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": result.file.length.toString(),
      },
    });
  }
  catch (error) {
    console.error("Error downloading update:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function handleListVersions(c: Context) {
  try {
    const params = z.object({
      appId: z.string(),
      platform: z.string(),
    }).safeParse(c.req.param());

    if (!params.success) {
      return c.json({ error: "Invalid parameters" }, 400);
    }

    const { appId, platform } = params.data;
    const metadata = await service.loadMetadata();
    const versions = (metadata[appId]?.[platform] || []).map(version =>
      AppVersionSchema.parse(version),
    );

    return c.json({ appId, platform, versions });
  }
  catch (error) {
    console.error("Error listing versions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
