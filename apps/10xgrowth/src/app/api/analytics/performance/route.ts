import { createSupabaseClient } from '@sasarjan/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pageId,
      loadTime,
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift,
      firstInputDelay,
    } = body;

    const supabase = createSupabaseClient();

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
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      );
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