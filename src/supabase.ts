import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncfiaqdkjaowxrlvucti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZmlhcWRramFvd3hybHZ1Y3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTY4NDEsImV4cCI6MjA5NDQ3Mjg0MX0.OQgg3LWIe5QDiofhdF2rnQa4vtee7HvvUPa8f0N2sQI';

export const supabase = createClient(supabaseUrl, supabaseKey);
