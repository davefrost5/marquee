import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

function uploadFilename(file: File, kind: string) {
  const ext = path.extname(file.name) || ".bin";
  return `${kind}-${randomUUID()}${ext}`;
}

async function saveUploadLocal(
  file: File,
  tenantId: string,
  kind: string,
): Promise<string> {
  const filename = uploadFilename(file, kind);
  const dir = path.join(process.cwd(), "public", "uploads", tenantId);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${tenantId}/${filename}`;
}

async function saveUploadBlob(
  file: File,
  tenantId: string,
  kind: string,
): Promise<string> {
  const filename = uploadFilename(file, kind);
  const pathname = `uploads/${tenantId}/${filename}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function saveUpload(
  file: File,
  tenantId: string,
  kind: string,
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return saveUploadBlob(file, tenantId, kind);
  }
  return saveUploadLocal(file, tenantId, kind);
}

export function isImage(file: File) {
  return file.type.startsWith("image/");
}

export function isVideo(file: File) {
  return file.type.startsWith("video/");
}
