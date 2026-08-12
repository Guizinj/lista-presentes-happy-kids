import { supabase } from "../supabase-client.js";

function getClient() {
  if (!supabase) {
    throw new Error("Configure o Supabase antes de gerenciar listas.");
  }

  return supabase;
}

export async function createGiftList({ childName, eventDate }) {
  const { data, error } = await getClient()
    .from("gift_lists")
    .insert({ child_name: childName.trim(), event_date: eventDate })
    .select("id, child_name, event_date, public_slug")
    .single();

  if (error) throw error;
  return data;
}

export async function getGiftLists() {
  const { data, error } = await getClient()
    .from("gift_lists")
    .select("id, child_name, event_date, public_slug, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteGiftList(id) {
  const { data, error } = await getClient()
    .from("gift_lists")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
