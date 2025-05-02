import type { ServerLoad } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const load: ServerLoad = async () => {
const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('updated_at', { ascending: false });  // ← use updated_at instead

  if (error) {
    console.error('Failed to load prompts', error);
    throw error;
  }

  return { prompts: data };
};