import { STORAGE_BUCKET } from "../config.js";
import { supabase } from "../supabase-client.js";

function getClient() {
  if (!supabase) {
    throw new Error("Configure o Supabase antes de enviar fotos.");
  }

  return supabase;
}

function createStoragePath(listId, extension) {
  const fileId = crypto.randomUUID();
  return `gift-lists/${listId}/${fileId}.${extension}`;
}

function getExtension(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function uploadToyImage(listId, file) {
  const client = getClient();
  const path = createStoragePath(listId, getExtension(file));
  const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;

  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}

export async function removeToyImage(path) {
  if (!path) return;

  const { error } = await getClient().storage.from(STORAGE_BUCKET).remove([path]);

  if (error) throw error;
}
