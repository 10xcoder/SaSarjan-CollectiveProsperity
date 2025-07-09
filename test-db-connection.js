// Quick test to check database connection and data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOEFntlF5DQWQs_b1LQI0JNgx8N5EwCE-pUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Database error:', error);
      return;
    }
    
    console.log('✅ Database connected successfully!');
    console.log('📊 Found', data.length, 'CMS pages');
    
    if (data.length > 0) {
      console.log('📋 Sample page data:');
      data.forEach(page => {
        console.log(`  - ${page.title} (/${page.slug}) - ${page.status}`);
      });
    } else {
      console.log('⚠️  No pages found in database');
      
      // Try to insert a simple test page
      console.log('Inserting test page...');
      const { data: insertData, error: insertError } = await supabase
        .from('cms_pages')
        .insert({
          title: 'Test Landing Page',
          slug: 'test',
          description: 'A simple test page',
          type: 'landing',
          template: 'default',
          status: 'published',
          visibility: 'public',
          app_id: '10xgrowth',
          blocks: JSON.stringify([{
            id: 'hero_test',
            type: 'hero',
            order: 0,
            data: {
              headline: 'Test Page Working!',
              subheadline: 'This confirms the database is connected',
              description: 'If you can see this page, the CMS system is working correctly.',
              alignment: 'center'
            }
          }]),
          settings: JSON.stringify({}),
          seo: JSON.stringify({
            title: 'Test Page',
            description: 'Test page for CMS'
          })
        })
        .select();
      
      if (insertError) {
        console.error('❌ Insert error:', insertError);
      } else {
        console.log('✅ Test page inserted successfully!');
        console.log('🌐 Try visiting: http://localhost:3001/test');
      }
    }
    
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}

testDatabase();