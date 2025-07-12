import { createSupabaseClient } from '@sasarjan/database';
import Link from 'next/link';

export default async function LandingPagesPage() {
  const supabase = createSupabaseClient();

  // Get all landing pages for 10xgrowth
  const { data: pages, error } = await supabase
    .from('cms_pages')
    .select(`
      id,
      title,
      slug,
      type,
      status,
      visibility,
      created_at,
      updated_at,
      published_at
    `)
    .eq('app_id', '10xgrowth') // Filter for 10xgrowth app only
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching pages:', error);
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    archived: 'bg-yellow-100 text-yellow-800',
    unpublished: 'bg-red-100 text-red-800',
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your 10xGrowth landing pages and marketing content
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/landing-pages/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create New Page
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {Object.entries(
          pages?.reduce((acc: Record<string, number>, page: any) => {
            acc[page.status] = (acc[page.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {}
        ).map(([status, count]) => (
          <div key={status} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {status}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{String(count)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pages Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {pages && pages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page: any) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {page.title}
                          </div>
                          <div className="text-sm text-gray-500">/{page.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {page.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[page.status as keyof typeof statusColors]
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {page.visibility}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/landing-pages/${page.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          {page.status === 'published' && (
                            <Link
                              href={`/${page.slug}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-900"
                            >
                              View
                            </Link>
                          )}
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No landing pages yet
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first landing page for 10xGrowth.
              </p>
              <Link
                href="/admin/landing-pages/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Page
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}