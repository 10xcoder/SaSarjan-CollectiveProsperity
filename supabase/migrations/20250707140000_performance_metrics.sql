-- Performance Metrics Table
-- Created: 07-Jul-2025, Monday 15:45 IST

-- Performance metrics table for Core Web Vitals tracking
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
    
    -- Core Web Vitals
    load_time DECIMAL(10,2), -- Total page load time in milliseconds
    first_contentful_paint DECIMAL(10,2), -- FCP in milliseconds
    largest_contentful_paint DECIMAL(10,2), -- LCP in milliseconds
    cumulative_layout_shift DECIMAL(10,4), -- CLS score
    first_input_delay DECIMAL(10,2), -- FID in milliseconds
    
    -- Additional metrics
    time_to_interactive DECIMAL(10,2), -- TTI in milliseconds
    total_blocking_time DECIMAL(10,2), -- TBT in milliseconds
    
    -- User context
    user_agent TEXT,
    viewport_width INTEGER,
    viewport_height INTEGER,
    connection_type VARCHAR(20), -- 4g, 3g, wifi, etc.
    device_type VARCHAR(20), -- mobile, tablet, desktop
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_performance_metrics_page_id ON performance_metrics(page_id);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_performance_metrics_device_type ON performance_metrics(device_type);

-- Function to get average performance metrics for a page
CREATE OR REPLACE FUNCTION get_page_performance_stats(input_page_id UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    page_id UUID,
    avg_load_time DECIMAL,
    avg_fcp DECIMAL,
    avg_lcp DECIMAL,
    avg_cls DECIMAL,
    avg_fid DECIMAL,
    p95_load_time DECIMAL,
    p95_lcp DECIMAL,
    total_sessions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.page_id,
        ROUND(AVG(pm.load_time), 2) as avg_load_time,
        ROUND(AVG(pm.first_contentful_paint), 2) as avg_fcp,
        ROUND(AVG(pm.largest_contentful_paint), 2) as avg_lcp,
        ROUND(AVG(pm.cumulative_layout_shift), 4) as avg_cls,
        ROUND(AVG(pm.first_input_delay), 2) as avg_fid,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY pm.load_time), 2) as p95_load_time,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY pm.largest_contentful_paint), 2) as p95_lcp,
        COUNT(*)::INTEGER as total_sessions
    FROM performance_metrics pm
    WHERE pm.page_id = input_page_id
        AND pm.timestamp >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY pm.page_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get Core Web Vitals compliance
CREATE OR REPLACE FUNCTION get_core_web_vitals_compliance(input_page_id UUID DEFAULT NULL, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    page_id UUID,
    page_title VARCHAR,
    lcp_good_rate DECIMAL,
    fid_good_rate DECIMAL,
    cls_good_rate DECIMAL,
    overall_score VARCHAR,
    total_sessions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.page_id,
        cp.title,
        ROUND(
            (COUNT(*) FILTER (WHERE pm.largest_contentful_paint <= 2500)::DECIMAL / COUNT(*)) * 100, 
            2
        ) as lcp_good_rate,
        ROUND(
            (COUNT(*) FILTER (WHERE pm.first_input_delay <= 100)::DECIMAL / COUNT(*)) * 100, 
            2
        ) as fid_good_rate,
        ROUND(
            (COUNT(*) FILTER (WHERE pm.cumulative_layout_shift <= 0.1)::DECIMAL / COUNT(*)) * 100, 
            2
        ) as cls_good_rate,
        CASE 
            WHEN (
                (COUNT(*) FILTER (WHERE pm.largest_contentful_paint <= 2500)::DECIMAL / COUNT(*)) >= 0.75 AND
                (COUNT(*) FILTER (WHERE pm.first_input_delay <= 100)::DECIMAL / COUNT(*)) >= 0.75 AND
                (COUNT(*) FILTER (WHERE pm.cumulative_layout_shift <= 0.1)::DECIMAL / COUNT(*)) >= 0.75
            ) THEN 'Good'
            WHEN (
                (COUNT(*) FILTER (WHERE pm.largest_contentful_paint <= 4000)::DECIMAL / COUNT(*)) >= 0.5 AND
                (COUNT(*) FILTER (WHERE pm.first_input_delay <= 300)::DECIMAL / COUNT(*)) >= 0.5 AND
                (COUNT(*) FILTER (WHERE pm.cumulative_layout_shift <= 0.25)::DECIMAL / COUNT(*)) >= 0.5
            ) THEN 'Needs Improvement'
            ELSE 'Poor'
        END as overall_score,
        COUNT(*)::INTEGER as total_sessions
    FROM performance_metrics pm
    JOIN cms_pages cp ON pm.page_id = cp.id
    WHERE (input_page_id IS NULL OR pm.page_id = input_page_id)
        AND pm.timestamp >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY pm.page_id, cp.title
    ORDER BY total_sessions DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance trends
CREATE OR REPLACE FUNCTION get_performance_trends(input_page_id UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date_bucket DATE,
    avg_load_time DECIMAL,
    avg_lcp DECIMAL,
    sessions_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.timestamp::DATE as date_bucket,
        ROUND(AVG(pm.load_time), 2) as avg_load_time,
        ROUND(AVG(pm.largest_contentful_paint), 2) as avg_lcp,
        COUNT(*)::INTEGER as sessions_count
    FROM performance_metrics pm
    WHERE pm.page_id = input_page_id
        AND pm.timestamp >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY pm.timestamp::DATE
    ORDER BY date_bucket;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Admin can view all performance metrics
CREATE POLICY "Admin can view performance metrics" ON performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
        )
    );

-- Success message
SELECT 'Performance metrics table and functions created successfully!' as message;