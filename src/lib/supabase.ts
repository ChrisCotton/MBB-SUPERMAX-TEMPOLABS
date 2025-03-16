import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase-types";

const supabaseUrl = "https://hovhfdrwaruhbqhmnqil.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdmhmZHJ3YXJ1aGJxaG1ucWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2OTU5OTksImV4cCI6MjA1NjI3MTk5OX0.JhjkP1SD9hZwa1pWdpQkAzM7_BkC0S9fqltqXmp0KsQ";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
