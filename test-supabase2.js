const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const userId = 'mock-user-id';
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('ERROR DETAILS:', JSON.stringify(error, null, 2));
    console.error('RAW ERROR:', error);
  } else {
    console.log('SUCCESS, DATA:', data);
  }
}

test();
