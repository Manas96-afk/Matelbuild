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
  console.log('Testing insert...');
  const { data, error } = await supabase.from('projects').insert({
    user_id: 'mock-user-123',
    projectName: 'Test Project',
    plotLength: 10,
    plotWidth: 10,
    unit: 'Feet',
    plotType: 'Residential',
    floors: 1,
    quality: 'Standard',
    bedrooms: 1,
    bathrooms: 1,
    kitchens: 1,
    livingRooms: 1,
    balconies: 1,
    parkingRequired: false,
    state: 'NY',
    city: 'NYC',
    floorHeight: 10,
    wallType: 'Brick',
    pccGrade: 'M15',
    rccGrade: 'M20',
    flooringType: 'Tile',
    wastageOption: 5,
    country: 'USA'
  }).select();
  console.log('Insert Error:', error ? JSON.stringify(error, null, 2) : 'null');
  console.log('Insert Data:', JSON.stringify(data, null, 2));
}
run();
