import { createSupabaseClient } from '@sasarjan/database';

export default async function AnalyticsPage() {
  const supabase = createSupabaseClient();

  // Get Core Web Vitals compliance data
  const { data: webVitals } = await supabase.rpc('get_core_web_vitals_compliance', { days_back: 30 });
  
  // Get page analytics
  const { data: pageStats } = await supabase
    .from('page_analytics')
    .select(`
      page_id,
      views,
      unique_views,
      bounce_rate,
      average_time_on_page,
      cms_pages!inner(title, slug, type)
    `)
    .order('views', { ascending: false })
    .limit(10);

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Performance metrics and user analytics for your landing pages
        </p>
      </div>

      {/* Core Web Vitals */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Core Web Vitals (Last 30 Days)</h2>
        
        {webVitals && webVitals.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LCP Good Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FID Good Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CLS Good Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {webVitals.map((page: any) => (
                  <tr key={page.page_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page.page_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        page.lcp_good_rate >= 75 ? 'text-green-600' : 
                        page.lcp_good_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {page.lcp_good_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        page.fid_good_rate >= 75 ? 'text-green-600' : 
                        page.fid_good_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {page.fid_good_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        page.cls_good_rate >= 75 ? 'text-green-600' : 
                        page.cls_good_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {page.cls_good_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        page.overall_score === 'Good' ? 'bg-green-100 text-green-800' :
                        page.overall_score === 'Needs Improvement' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {page.overall_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.total_sessions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center">
              No performance data available yet. Performance metrics will appear here once pages start receiving traffic.
            </p>
          </div>
        )}
      </div>

      {/* Page Performance */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Top Performing Pages</h2>
        
        {pageStats && pageStats.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bounce Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageStats.map((page: any) => (
                  <tr key={page.page_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {page.cms_pages.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{page.cms_pages.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {page.cms_pages.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.views?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.unique_views?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (page.bounce_rate || 0) < 40 ? 'text-green-600' : 
                        (page.bounce_rate || 0) < 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {page.bounce_rate || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor((page.average_time_on_page || 0) / 60)}m {((page.average_time_on_page || 0) % 60)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center">
              No page analytics available yet. Analytics will appear here once pages start receiving traffic.
            </p>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Performance Optimization Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>LCP (Largest Contentful Paint):</strong> Optimize images, use CDN, enable compression</li>
          <li>• <strong>FID (First Input Delay):</strong> Minimize JavaScript execution time, defer non-critical JS</li>
          <li>• <strong>CLS (Cumulative Layout Shift):</strong> Set dimensions for images, avoid dynamic content insertion</li>
          <li>• <strong>General:</strong> Use Next.js Image optimization, enable caching, minify assets</li>
        </ul>
      </div>
    </div>
  );
}