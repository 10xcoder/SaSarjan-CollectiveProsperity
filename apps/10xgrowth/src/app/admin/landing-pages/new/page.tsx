'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@sasarjan/database';
import { useRouter } from 'next/navigation';

export default function NewLandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    type: 'landing',
    template: 'b2b-growth-landing-pro',
    visibility: 'public',
  });

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createSupabaseClient();
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Get admin user
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (!adminUser) {
        throw new Error('Admin access required');
      }

      // Get the selected template
      const { data: template } = await supabase
        .from('cms_templates')
        .select('blocks, settings')
        .eq('slug', formData.template)
        .single();

      // Create the page
      const { data: newPage, error } = await supabase
        .from('cms_pages')
        .insert({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          type: formData.type,
          template: formData.template,
          visibility: formData.visibility,
          status: 'draft',
          app_id: '10xgrowth',
          created_by: adminUser.id,
          last_edited_by: adminUser.id,
          blocks: template?.blocks || [],
          settings: template?.settings || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to edit page
      router.push(`/admin/landing-pages/${newPage.id}`);
    } catch (error) {
      console.error('Error creating page:', error);
      alert('Failed to create page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Landing Page</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set up a new landing page for your 10xGrowth marketing campaigns
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Page Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10X Your Business Growth"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  URL Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10x-your-business-growth"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL: 10xgrowth.com/{formData.slug}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of this landing page..."
              />
            </div>
          </div>

          {/* Page Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Page Settings
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Page Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="landing">Landing Page</option>
                  <option value="about">About Page</option>
                  <option value="pricing">Pricing Page</option>
                  <option value="features">Features Page</option>
                  <option value="contact">Contact Page</option>
                  <option value="case_study">Case Study</option>
                </select>
              </div>

              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                  Template
                </label>
                <select
                  id="template"
                  value={formData.template}
                  onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="b2b-growth-landing-pro">B2B Growth Landing Pro</option>
                  <option value="freelancer-marketplace">Freelancer Marketplace</option>
                  <option value="service-category-landing">Service Category Landing</option>
                  <option value="pricing-plans">Pricing & Plans</option>
                  <option value="about-company">About Company</option>
                  <option value="default">Default Template</option>
                </select>
              </div>

              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                  Visibility
                </label>
                <select
                  id="visibility"
                  value={formData.visibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Template Preview
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                {formData.template === 'b2b-growth-landing-pro' && (
                  <div>
                    <p><strong>B2B Growth Landing Page Pro</strong></p>
                    <p>Includes: Hero, Stats, Features, Testimonials, CTA</p>
                    <p>Optimized for: B2B lead generation, Business growth services</p>
                  </div>
                )}
                {formData.template === 'freelancer-marketplace' && (
                  <div>
                    <p><strong>Freelancer Marketplace</strong></p>
                    <p>Includes: Hero, Service categories, Process steps, CTA</p>
                    <p>Optimized for: Freelancer discovery, Project posting</p>
                  </div>
                )}
                {formData.template === 'service-category-landing' && (
                  <div>
                    <p><strong>Service Category Landing</strong></p>
                    <p>Includes: Service-focused hero, Expert features, CTA</p>
                    <p>Optimized for: Specific service promotion, Expert showcasing</p>
                  </div>
                )}
                {formData.template === 'pricing-plans' && (
                  <div>
                    <p><strong>Pricing & Plans</strong></p>
                    <p>Includes: Hero, Pricing table, FAQ section</p>
                    <p>Optimized for: Plan comparison, Subscription conversion</p>
                  </div>
                )}
                {formData.template === 'about-company' && (
                  <div>
                    <p><strong>About Company</strong></p>
                    <p>Includes: Hero, Story, Values, Team showcase</p>
                    <p>Optimized for: Brand storytelling, Trust building</p>
                  </div>
                )}
                {formData.template === 'default' && (
                  <div>
                    <p><strong>Default Template</strong></p>
                    <p>Includes: Basic layout, Flexible content blocks</p>
                    <p>Optimized for: Custom content, General purpose</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}