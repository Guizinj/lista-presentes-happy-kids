import { supabase } from "../supabase-client.js";

function getClient() {
  if (!supabase) {
    throw new Error("A conexão com a lista pública não está configurada.");
  }

  return supabase;
}

function normalizeList(data) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const list = data[0];
  if (
    !list ||
    typeof list.id !== "string" ||
    typeof list.child_name !== "string" ||
    typeof list.event_date !== "string"
  ) {
    return null;
  }

  return {
    id: list.id,
    childName: list.child_name,
    eventDate: list.event_date,
  };
}

function normalizeItems(data) {
  if (!Array.isArray(data)) return [];

  return data.flatMap((item) => {
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.image_url !== "string" ||
      !["available", "sold"].includes(item.status)
    ) {
      return [];
    }

    const price = item.price === null ? null : Number(item.price);

    return [
      {
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        price: Number.isFinite(price) && price >= 0 ? price : null,
        status: item.status,
      },
    ];
  });
}

export async function getPublicGiftList(slug) {
  const { data, error } = await getClient().rpc("get_public_gift_list", {
    p_list_slug: slug,
  });

  if (error) throw error;
  return normalizeList(data);
}

export async function getPublicGiftItems(slug) {
  const { data, error } = await getClient().rpc("get_public_gift_items", {
    p_list_slug: slug,
  });

  if (error) throw error;
  return normalizeItems(data);
}
