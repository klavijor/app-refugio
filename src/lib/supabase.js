import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pyghbyrfmxsfokkjwvnu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z2hieXJmbXhzZm9ra2p3dm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NDE2NTcsImV4cCI6MjA1OTExNzY1N30.sjdtfmgFfc8KN18zQRCrCwQBLlZvaDfcgzW5nJ3HOYA'

export const supabase = createClient(supabaseUrl, supabaseKey)
