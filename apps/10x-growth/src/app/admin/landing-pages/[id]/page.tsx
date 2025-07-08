'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@sasarjan/database';
import { useRouter } from 'next/navigation';
// import { PageManager } from '@sasarjan/cms'; // TODO: Implement CMS package

interface ContentBlock {
  id: string;
  type: string;
  order: number;
  data: any;
  settings?: any;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  template: string;
  status: string;
  visibility: string;
  blocks: ContentBlock[];
  seo: any;
  settings: any;
}

export default function EditLandingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  useEffect(() => {
    loadPage();
  }, [params.id]);

  const loadPage = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setPage(data);
    } catch (error) {
      console.error('Error loading page:', error);
      alert('Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  const savePage = async () => {
    if (!page) return;
    
    setIsSaving(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from('cms_pages')
        .update({
          title: page.title,
          slug: page.slug,
          description: page.description,
          blocks: page.blocks,
          settings: page.settings,
          seo: page.seo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', page.id);

      if (error) throw error;
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const publishPage = async () => {
    if (!page) return;
    
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from('cms_pages')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', page.id);

      if (error) throw error;
      setPage(prev => prev ? { ...prev, status: 'published' } : null);
      alert('Page published successfully!');
    } catch (error) {
      console.error('Error publishing page:', error);
      alert('Failed to publish page');
    }
  };

  const addBlock = (type: string) => {
    if (!page) return;

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      order: page.blocks.length,
      data: getDefaultBlockData(type),
    };

    setPage(prev => prev ? {
      ...prev,
      blocks: [...prev.blocks, newBlock]
    } : null);
  };

  const updateBlock = (blockId: string, data: any) => {
    if (!page) return;

    setPage(prev => prev ? {
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, data } : block
      )
    } : null);
  };

  const deleteBlock = (blockId: string) => {
    if (!page) return;

    setPage(prev => prev ? {
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    } : null);
    setSelectedBlock(null);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!page) return;

    const blocks = [...page.blocks];
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    
    if (direction === 'up' && blockIndex > 0) {
      [blocks[blockIndex], blocks[blockIndex - 1]] = [blocks[blockIndex - 1], blocks[blockIndex]];
    } else if (direction === 'down' && blockIndex < blocks.length - 1) {
      [blocks[blockIndex], blocks[blockIndex + 1]] = [blocks[blockIndex + 1], blocks[blockIndex]];
    }

    // Update order values
    blocks.forEach((block, index) => {
      block.order = index;
    });

    setPage(prev => prev ? { ...prev, blocks } : null);
  };

  const getDefaultBlockData = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          headline: 'Your Compelling Headline',
          subheadline: 'Supporting subheadline',
          description: 'Detailed description of your offering',
          ctaPrimary: { text: 'Get Started', url: '#', style: 'primary' },
          alignment: 'center'
        };
      case 'features':
        return {
          title: 'Key Features',
          subtitle: 'What makes us different',
          layout: 'grid',
          columns: 3,
          features: [
            { id: 'feat-1', title: 'Feature 1', description: 'Feature description', order: 1 },
            { id: 'feat-2', title: 'Feature 2', description: 'Feature description', order: 2 },
            { id: 'feat-3', title: 'Feature 3', description: 'Feature description', order: 3 },
          ]
        };
      case 'text':
        return {
          content: '<p>Your content here...</p>',
          format: 'html',
          alignment: 'left'
        };
      case 'cta':
        return {
          headline: 'Ready to Get Started?',
          description: 'Join thousands of satisfied customers',
          button: { text: 'Start Now', url: '#', style: 'primary', size: 'large' },
          alignment: 'center'
        };
      default:
        return {};
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Page not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{page.title}</h1>
                <p className="text-sm text-gray-500">/{page.slug}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                page.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {page.status}
              </span>
              <button
                onClick={savePage}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              {page.status !== 'published' && (
                <button
                  onClick={publishPage}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Publish
                </button>
              )}
              {page.status === 'published' && (
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  View Live
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['content', 'settings', 'seo'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Block Library */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-gray-900 mb-4">Add Blocks</h3>
                <div className="space-y-2">
                  {[
                    { type: 'hero', label: 'Hero Section', icon: '🎯' },
                    { type: 'features', label: 'Features', icon: '⭐' },
                    { type: 'stats', label: 'Statistics', icon: '📊' },
                    { type: 'testimonials', label: 'Testimonials', icon: '💬' },
                    { type: 'text', label: 'Text Block', icon: '📝' },
                    { type: 'cta', label: 'Call to Action', icon: '🚀' },
                    { type: 'faq', label: 'FAQ Section', icon: '❓' },
                    { type: 'team', label: 'Team Members', icon: '👥' },
                  ].map((blockType) => (
                    <button
                      key={blockType.type}
                      onClick={() => addBlock(blockType.type)}
                      className="w-full flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      <span className="mr-3">{blockType.icon}</span>
                      <span className="text-sm font-medium">{blockType.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Builder */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h3 className="font-medium text-gray-900">Page Content</h3>
                </div>
                <div className="p-4 space-y-4">
                  {page.blocks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No content blocks yet. Add blocks from the library to get started.</p>
                    </div>
                  ) : (
                    page.blocks
                      .sort((a, b) => a.order - b.order)
                      .map((block) => (
                        <div
                          key={block.id}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            selectedBlock === block.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedBlock(block.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium capitalize">{block.type} Block</span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, 'up');
                                }}
                                disabled={block.order === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                ↑
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, 'down');
                                }}
                                disabled={block.order === page.blocks.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                ↓
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBlock(block.id);
                                }}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {block.type === 'hero' && block.data.headline}
                            {block.type === 'features' && `${block.data.features?.length || 0} features`}
                            {block.type === 'text' && 'Text content'}
                            {block.type === 'cta' && block.data.headline}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Block Editor */}
            <div className="lg:col-span-1">
              {selectedBlock ? (
                <BlockEditor
                  block={page.blocks.find(b => b.id === selectedBlock)!}
                  onUpdate={(data) => updateBlock(selectedBlock, data)}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500 text-center">
                    Select a block to edit its properties
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <PageSettingsEditor page={page} onUpdate={setPage} />
        )}

        {activeTab === 'seo' && (
          <SEOEditor page={page} onUpdate={setPage} />
        )}
      </div>
    </div>
  );
}

// Block Editor Component
function BlockEditor({ block, onUpdate }: { block: ContentBlock; onUpdate: (data: any) => void }) {
  const [data, setData] = useState(block.data);

  useEffect(() => {
    setData(block.data);
  }, [block]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium text-gray-900 mb-4 capitalize">{block.type} Settings</h3>
      
      {block.type === 'hero' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              value={data.headline || ''}
              onChange={(e) => handleChange('headline', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
            <input
              type="text"
              value={data.subheadline || ''}
              onChange={(e) => handleChange('subheadline', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA Text</label>
            <input
              type="text"
              value={data.ctaPrimary?.text || ''}
              onChange={(e) => handleChange('ctaPrimary', { ...data.ctaPrimary, text: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA URL</label>
            <input
              type="text"
              value={data.ctaPrimary?.url || ''}
              onChange={(e) => handleChange('ctaPrimary', { ...data.ctaPrimary, url: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {block.type === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={data.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={6}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {block.type === 'cta' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              value={data.headline || ''}
              onChange={(e) => handleChange('headline', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={data.button?.text || ''}
              onChange={(e) => handleChange('button', { ...data.button, text: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
            <input
              type="text"
              value={data.button?.url || ''}
              onChange={(e) => handleChange('button', { ...data.button, url: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Page Settings Editor Component
function PageSettingsEditor({ page, onUpdate }: { page: PageData; onUpdate: (page: PageData) => void }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Page Settings</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => onUpdate({ ...page, title: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
          <input
            type="text"
            value={page.slug}
            onChange={(e) => onUpdate({ ...page, slug: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={page.description || ''}
            onChange={(e) => onUpdate({ ...page, description: e.target.value })}
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Page Type</label>
          <select
            value={page.type}
            onChange={(e) => onUpdate({ ...page, type: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="landing">Landing Page</option>
            <option value="about">About Page</option>
            <option value="pricing">Pricing Page</option>
            <option value="features">Features Page</option>
            <option value="contact">Contact Page</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
          <select
            value={page.visibility}
            onChange={(e) => onUpdate({ ...page, visibility: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// SEO Editor Component
function SEOEditor({ page, onUpdate }: { page: PageData; onUpdate: (page: PageData) => void }) {
  const seo = page.seo || {};

  const updateSEO = (field: string, value: any) => {
    const newSEO = { ...seo, [field]: value };
    onUpdate({ ...page, seo: newSEO });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">SEO Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
          <input
            type="text"
            value={seo.title || ''}
            onChange={(e) => updateSEO('title', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="SEO title for search engines"
          />
          <p className="mt-1 text-sm text-gray-500">
            {(seo.title || '').length}/60 characters recommended
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea
            value={seo.description || ''}
            onChange={(e) => updateSEO('description', e.target.value)}
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description for search results"
          />
          <p className="mt-1 text-sm text-gray-500">
            {(seo.description || '').length}/160 characters recommended
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
          <input
            type="text"
            value={seo.keywords?.join(', ') || ''}
            onChange={(e) => updateSEO('keywords', e.target.value.split(',').map(k => k.trim()))}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Title</label>
          <input
            type="text"
            value={seo.ogTitle || ''}
            onChange={(e) => updateSEO('ogTitle', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Title for social media sharing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Description</label>
          <textarea
            value={seo.ogDescription || ''}
            onChange={(e) => updateSEO('ogDescription', e.target.value)}
            rows={2}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Description for social media sharing"
          />
        </div>
      </div>
    </div>
  );
}