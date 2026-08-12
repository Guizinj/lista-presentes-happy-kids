import { supabase } from "../supabase-client.js";

function getClient() {
  if (!supabase) {
    throw new Error("Configure o Supabase antes de gerenciar brinquedos.");
  }

  return supabase;
}

export async function getGiftListById(id) {
  const { data, error } = await getClient()
    .from("gift_lists")
    .select("id, child_name, event_date, public_slug")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getGiftItems(listId) {
  const { data, error } = await getClient()
    .from("gift_items")
    .select("id, list_id, title, price, image_url, image_path, status, created_at")
    .eq("list_id", listId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createGiftItem({ listId, title, price, imageUrl, imagePath }) {
  const { data, error } = await getClient()
    .from("gift_items")
    .insert({
      list_id: listId,
      title: title.trim(),
      price,
      image_url: imageUrl,
      image_path: imagePath,
    })
    .select("id, list_id, title, price, image_url, image_path, status, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function updateGiftItemStatus(id, status) {
  const { data, error } = await getClient()
    .from("gift_items")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGiftItem(id) {
  const { error } = await getClient().from("gift_items").delete().eq("id", id);

  if (error) throw error;
}
