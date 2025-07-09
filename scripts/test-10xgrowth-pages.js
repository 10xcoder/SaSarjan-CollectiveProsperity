#!/usr/bin/env node

// Test script to verify 10xGrowth pages are accessible
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://localhost:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOEFntlF5DQWQs_b1LQI0JNgx8N5EwCE-pUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPages() {
    console.log('Testing 10xGrowth pages...\n');
    
    const slugs = ['home', 'join-freelancers', 'for-businesses', 'business-growth', 'about'];
    
    for (const slug of slugs) {
        const { data, error } = await supabase
            .from('cms_pages')
            .select('title, slug, status, visibility, blocks')
            .eq('slug', slug)
            .eq('app_id', '10xgrowth')
            .eq('status', 'published')
            .eq('visibility', 'public')
            .single();
        
        if (error) {
            console.log(`❌ /${slug} - ERROR: ${error.message}`);
        } else if (data) {
            const blockCount = data.blocks ? data.blocks.length : 0;
            console.log(`✅ /${slug} - "${data.title}" (${blockCount} blocks)`);
        } else {
            console.log(`❌ /${slug} - Page not found`);
        }
    }
    
    console.log('\nPages will be accessible at:');
    console.log('- http://localhost:3003/');
    console.log('- http://localhost:3003/join-freelancers');
    console.log('- http://localhost:3003/for-businesses');
    console.log('- http://localhost:3003/business-growth');
    console.log('- http://localhost:3003/about');
    console.log('\nTo start the app, run: cd apps/10xgrowth && pnpm dev');
}

testPages().catch(console.error);