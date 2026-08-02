import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://efdnfdhwghsszsqaycbe.supabase.co";
const supabaseAnonKey = "sb_publishable_JEfARD4rvRnyrcbiiqdgvg_rzNxxwc8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
