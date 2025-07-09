import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@sasarjan/database';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and has admin permissions
  const supabase = createSupabaseClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  // Check if user has admin access
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', session.user.email)
    .eq('status', 'active')
    .single();

  if (!adminUser) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                10xGrowth Admin
              </h1>
              <div className="ml-10 flex space-x-8">
                <a
                  href="/admin"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/admin/landing-pages"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Landing Pages
                </a>
                <a
                  href="/admin/templates"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Templates
                </a>
                <a
                  href="/admin/analytics"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                {adminUser.full_name} ({adminUser.role})
              </span>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-gray-400 hover:text-gray-600"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}