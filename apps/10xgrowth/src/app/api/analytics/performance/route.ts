import { createSupabaseClient } from '@sasarjan/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if request has body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { error: 'No request body provided' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      pageId,
      loadTime,
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift,
      firstInputDelay,
    } = body;

    // Validate required fields
    if (!pageId) {
      return NextResponse.json(
        { error: 'Missing required field: pageId' },
        { status: 400 }
      );
    }

    // Try to use service role client for analytics (bypasses RLS)
    const supabase = createSupabaseClient(true); // true for service role

    // Check if we have service role access
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Service role key not available, skipping analytics storage');
      return NextResponse.json({ 
        success: true, 
        message: 'Analytics disabled - no service key' 
      });
    }

    // Store performance metrics
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        page_id: pageId,
        load_time: loadTime,
        first_contentful_paint: firstContentfulPaint,
        largest_contentful_paint: largestContentfulPaint,
        cumulative_layout_shift: cumulativeLayoutShift,
        first_input_delay: firstInputDelay,
        user_agent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to store performance metrics:', error);
      // Don't fail the request, just log the error
      return NextResponse.json({ 
        success: true, 
        warning: 'Analytics storage failed but request succeeded' 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}