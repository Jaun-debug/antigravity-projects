import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveProject(userId: string, prompt: string, code: string, url: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ user_id: userId, prompt, generated_code: code, deploy_url: url }])
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving project to Supabase:', error);
    return null;
  }
}
