import { Catbox } from "node-catbox";
import { Readable } from "node:stream";

export interface CatboxResult {
  url: string;
}

/**
 * Upload via Catbox.moe using node-catbox package.
 * Anonymous upload works out-of-the-box.
 * Set CATBOX_USERHASH in environment variables for user-managed uploads/albums.
 */
export async function uploadToCatbox(file: File): Promise<CatboxResult> {
  const userHash = process.env.CATBOX_USERHASH?.trim() || undefined;
  const catbox = new Catbox(userHash);

  // Convert File arrayBuffer to a Node readable stream
  const arrayBuffer = await file.arrayBuffer();
  const stream = Readable.from(Buffer.from(arrayBuffer));

  const ext = file.name?.split(".").pop() || file.type.split("/")[1] || "jpg";
  const filename = file.name || `upload-${Date.now()}.${ext}`;

  try {
    const url = await catbox.uploadFileStream({
      stream,
      filename,
    });

    if (typeof url === "string" && url.startsWith("http")) {
      return { url: url.trim() };
    }

    throw new Error(typeof url === "string" ? url : "Respons Catbox tidak valid");
  } catch (error: any) {
    // Fallback: direct HTTP upload to Catbox API if stream upload encounters an issue
    const CATBOX_API = "https://catbox.moe/user/api.php";
    const form = new FormData();
    form.append("reqtype", "fileupload");
    if (userHash) form.append("userhash", userHash);
    form.append("fileToUpload", file);

    const res = await fetch(CATBOX_API, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Catbox upload failed (${res.status}): ${txt}`);
    }

    const text = (await res.text()).trim();
    if (!text.startsWith("http")) {
      throw new Error(`Catbox upload error: ${text}`);
    }

    return { url: text };
  }
}

