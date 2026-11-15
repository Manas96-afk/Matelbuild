const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const envObj = {};
env.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    envObj[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(envObj.NEXT_PUBLIC_SUPABASE_URL, envObj.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Querying latest project...');
  const { data, error } = await supabase.from('projects').select('*').order('created_at', {ascending: false}).limit(1);
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}
run();
