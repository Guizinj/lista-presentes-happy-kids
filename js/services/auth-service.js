import { supabase } from "../supabase-client.js";

function getClient() {
  if (!supabase) {
    throw new Error("Configure o Supabase antes de acessar a administração.");
  }

  return supabase;
}

export async function getCurrentSession() {
  const { data, error } = await getClient().auth.getSession();

  if (error) throw error;
  return data.session;
}

export async function signInWithPassword(email, password) {
  const { data, error } = await getClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await getClient().auth.signOut();

  if (error) throw error;
}
