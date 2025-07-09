import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Create a browser instance
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Setting up test environment...');
  
  // Wait for the admin app to be ready
  try {
    await page.goto(baseURL || 'http://localhost:3004');
    await page.waitForLoadState('networkidle');
    console.log('Admin app is ready for testing');
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    throw error;
  }

  // Set up test data - create admin user
  try {
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );

    // Create admin user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@sasarjan.com',
      password: 'password123',
    });

    if (!authError && authData.user) {
      // Add user to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          email: 'admin@sasarjan.com',
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (adminError) {
        console.log('Admin user may already exist:', adminError.message);
      } else {
        console.log('Admin user created successfully');
      }
    } else if (authError?.message?.includes('already registered')) {
      console.log('Admin user already exists');
    } else if (authError) {
      console.error('Failed to create admin user:', authError.message);
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
  
  await browser.close();
}

export default globalSetup;