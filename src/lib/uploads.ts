import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function saveUpload(
  file: File,
  tenantId: string,
  kind: string,
): Promise<string> {
  const ext = path.extname(file.name) || ".bin";
  const filename = `${kind}-${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", tenantId);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${tenantId}/${filename}`;
}

export function isImage(file: File) {
  return file.type.startsWith("image/");
}

export function isVideo(file: File) {
  return file.type.startsWith("video/");
}
