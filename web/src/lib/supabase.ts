import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mgbsbxzbdwxynpqqjbio.supabase.co';  // замените на ваш
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYnNieHpiZHd4eW5wcXFqYmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDk1NDgsImV4cCI6MjA5NTQ4NTU0OH0.vvDjxW616bjTk7YWPV4u2liCsOoPx8gIxlYI2E7xxZI';  // замените на ваш anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);