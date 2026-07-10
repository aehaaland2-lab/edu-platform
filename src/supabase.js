import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://subreomigrdnzgqfxxej.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YnJlb21pZ3JkbnpncWZ4eGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTM4MTUsImV4cCI6MjA5ODIyOTgxNX0.14jgdTAppz_oqkRM11c3UfngjG0f7k91Z8pTFDnXahw"

export const supabase = createClient(supabaseUrl, supabaseKey)