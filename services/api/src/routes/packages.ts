// Package Registry API Routes
import { Router } from 'express';
import { z } from 'zod';
import { MicroAppPackageRegistry, MicroAppPackageBuilder } from '@sasarjan/shared/lib/package-registry';
import { PipelineExecutor, PIPELINE_TEMPLATES } from '@sasarjan/shared/lib/pipeline-system';
import { PackageSearchFilters, PackageInstallOptions } from '@sasarjan/shared/types/developer';
import { supabase } from '../lib/supabase';
import { authenticateApiKey, authenticateDeveloper } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Package search and discovery
router.get('/search', async (req, res) => {
  try {
    const filters: PackageSearchFilters = {
      query: req.query.q as string,
      category: req.query.category as string,
      brand: req.query.brand as string,
      author: req.query.author as string,
      isTemplate: req.query.template === 'true',
      isFeatured: req.query.featured === 'true',
      minQualityScore: req.query.quality ? parseFloat(req.query.quality as string) : undefined,
      license: req.query.license ? (req.query.license as string).split(',') : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      sort: req.query.sort as any,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    // Build SQL query based on filters
    let query = supabase
      .from('micro_app_packages')
      .select(`
        *,
        author:users!micro_app_packages_author_id_fkey(id, email, full_name)
      `)
      .eq('status', 'published');

    if (filters.query) {
      query = query.textSearch('fts', filters.query);
    }

    if (filters.category) {
      query = query.contains('manifest->sasarjan->category', filters.category);
    }

    if (filters.brand) {
      query = query.contains('compatible_brands', [filters.brand]);
    }

    if (filters.author) {
      query = query.eq('author_id', filters.author);
    }

    if (filters.isTemplate !== undefined) {
      query = query.eq('is_template', filters.isTemplate);
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    if (filters.minQualityScore) {
      query = query.gte('quality_score', filters.minQualityScore);
    }

    if (filters.license?.length) {
      query = query.in('manifest->license', filters.license);
    }

    // Sorting
    switch (filters.sort) {
      case 'downloads':
        query = query.order('total_downloads', { ascending: false });
        break;
      case 'rating':
        query = query.order('quality_score', { ascending: false });
        break;
      case 'updated':
        query = query.order('updated_at', { ascending: false });
        break;
      case 'created':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('quality_score', { ascending: false });
    }

    // Pagination
    query = query.range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

    const { data: packages, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get facets for filtering UI
    const { data: facets } = await supabase
      .from('micro_app_packages')
      .select('manifest->sasarjan->category, manifest->license, author_id')
      .eq('status', 'published');

    const categoryFacets = new Map();
    const licenseFacets = new Map();
    const authorFacets = new Map();

    facets?.forEach(pkg => {
      const category = pkg.manifest?.sasarjan?.category;
      const license = pkg.manifest?.license;
      const author = pkg.author_id;

      if (category) {
        categoryFacets.set(category, (categoryFacets.get(category) || 0) + 1);
      }
      if (license) {
        licenseFacets.set(license, (licenseFacets.get(license) || 0) + 1);
      }
      if (author) {
        authorFacets.set(author, (authorFacets.get(author) || 0) + 1);
      }
    });

    res.json({
      packages: packages || [],
      totalCount: count || 0,
      facets: {
        categories: Array.from(categoryFacets.entries()).map(([name, count]) => ({ name, count })),
        licenses: Array.from(licenseFacets.entries()).map(([name, count]) => ({ name, count })),
        authors: Array.from(authorFacets.entries()).map(([name, count]) => ({ name, count })),
        tags: [] // TODO: Extract from package metadata
      },
      suggestions: [] // TODO: Implement search suggestions
    });

  } catch (error) {
    console.error('Package search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific package
router.get('/:packageName', async (req, res) => {
  try {
    const { packageName } = req.params;

    const { data: pkg, error } = await supabase
      .from('micro_app_packages')
      .select(`
        *,
        author:users!micro_app_packages_author_id_fkey(id, email, full_name),
        versions:package_versions(*)
      `)
      .eq('package_name', packageName)
      .eq('status', 'published')
      .single();

    if (error || !pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(pkg);

  } catch (error) {
    console.error('Package fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get package versions
router.get('/:packageName/versions', async (req, res) => {
  try {
    const { packageName } = req.params;

    // First get the package ID
    const { data: pkg } = await supabase
      .from('micro_app_packages')
      .select('id')
      .eq('package_name', packageName)
      .single();

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const { data: versions, error } = await supabase
      .from('package_versions')
      .select('*')
      .eq('package_id', pkg.id)
      .order('published_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(versions || []);

  } catch (error) {
    console.error('Package versions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific package version
router.get('/:packageName/versions/:version', async (req, res) => {
  try {
    const { packageName, version } = req.params;

    const { data: pkg } = await supabase
      .from('micro_app_packages')
      .select('id')
      .eq('package_name', packageName)
      .single();

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const { data: packageVersion, error } = await supabase
      .from('package_versions')
      .select('*')
      .eq('package_id', pkg.id)
      .eq('version', version)
      .single();

    if (error || !packageVersion) {
      return res.status(404).json({ error: 'Package version not found' });
    }

    res.json(packageVersion);

  } catch (error) {
    console.error('Package version fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Install package (increment metrics)
router.post('/:packageId/metrics/install', authenticateApiKey, async (req, res) => {
  try {
    const { packageId } = req.params;

    const { error } = await supabase
      .from('micro_app_packages')
      .update({
        total_downloads: supabase.raw('total_downloads + 1'),
        weekly_downloads: supabase.raw('weekly_downloads + 1'),
        install_count: supabase.raw('install_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', packageId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Install metrics update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish package (for approved submissions)
const publishPackageSchema = z.object({
  repositoryId: z.string().uuid(),
  packageName: z.string(),
  displayName: z.string(),
  description: z.string(),
  version: z.string(),
  packageConfig: z.object({
    entry: z.string(),
    types: z.string().optional()
  }),
  manifest: z.object({
    name: z.string(),
    version: z.string(),
    license: z.string()
  }),
  distUrl: z.string().url(),
  distTarballUrl: z.string().url().optional(),
  distIntegrityHash: z.string(),
  dependencies: z.record(z.string()).optional(),
  compatibleBrands: z.array(z.string()).optional()
});

router.post('/', authenticateDeveloper, validateRequest(publishPackageSchema), async (req, res) => {
  try {
    const packageData = req.body;
    const authorId = req.user.id;

    // Check if package name is available
    const { data: existingPkg } = await supabase
      .from('micro_app_packages')
      .select('id')
      .eq('package_name', packageData.packageName)
      .single();

    if (existingPkg) {
      return res.status(409).json({ error: 'Package name already exists' });
    }

    // Create package
    const { data: newPackage, error } = await supabase
      .from('micro_app_packages')
      .insert({
        repository_id: packageData.repositoryId,
        package_name: packageData.packageName,
        display_name: packageData.displayName,
        description: packageData.description,
        version: packageData.version,
        author_id: authorId,
        package_config: packageData.packageConfig,
        manifest: packageData.manifest,
        dist_url: packageData.distUrl,
        dist_tarball_url: packageData.distTarballUrl,
        dist_integrity_hash: packageData.distIntegrityHash,
        dependencies: packageData.dependencies || {},
        compatible_brands: packageData.compatibleBrands || [],
        status: 'published',
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Create initial version
    await supabase
      .from('package_versions')
      .insert({
        package_id: newPackage.id,
        version: packageData.version,
        is_latest: true,
        dist_url: packageData.distUrl,
        dist_tarball_url: packageData.distTarballUrl,
        dist_integrity_hash: packageData.distIntegrityHash,
        dependencies: packageData.dependencies || {},
        published_at: new Date().toISOString()
      });

    res.status(201).json(newPackage);

  } catch (error) {
    console.error('Package publish error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process developer submission through pipeline
const processSubmissionSchema = z.object({
  submissionData: z.object({
    repository: z.object({
      url: z.string().url(),
      type: z.enum(['github', 'gitlab', 'bitbucket']),
      branch: z.string().optional(),
      accessToken: z.string().optional()
    }),
    appInfo: z.object({
      name: z.string(),
      description: z.string(),
      category: z.string(),
      targetBrands: z.array(z.string())
    }),
    technical: z.object({
      packageName: z.string(),
      version: z.string(),
      entryPoint: z.string(),
      dependencies: z.record(z.string()),
      permissions: z.array(z.string())
    }),
    legal: z.object({
      license: z.string(),
      termsAccepted: z.boolean()
    })
  }),
  pipelineTemplate: z.enum(['basic', 'comprehensive']).default('comprehensive')
});

router.post('/process-submission', authenticateDeveloper, validateRequest(processSubmissionSchema), async (req, res) => {
  try {
    const { submissionData, pipelineTemplate } = req.body;
    const developerId = req.user.developerId;

    // Create repository record
    const { data: repository, error: repoError } = await supabase
      .from('micro_app_repositories')
      .insert({
        developer_id: developerId,
        name: submissionData.appInfo.name,
        repository_url: submissionData.repository.url,
        repository_type: submissionData.repository.type,
        description: submissionData.appInfo.description,
        submission_type: 'new_app',
        app_category: submissionData.appInfo.category,
        package_name: submissionData.technical.packageName,
        package_version: submissionData.technical.version,
        status: 'under_review'
      })
      .select()
      .single();

    if (repoError) {
      return res.status(500).json({ error: repoError.message });
    }

    // Set up pipeline context
    const workspaceDir = `/tmp/build-${repository.id}`;
    const context = {
      repositoryId: repository.id,
      submissionData,
      workspaceDir,
      artifacts: new Map(),
      environment: {
        NODE_ENV: 'production',
        PACKAGE_NAME: submissionData.technical.packageName,
        PACKAGE_VERSION: submissionData.technical.version
      }
    };

    // Create and execute pipeline
    const pipelineConfig = PIPELINE_TEMPLATES[pipelineTemplate];
    const executor = new PipelineExecutor(pipelineConfig, context);
    
    // Start pipeline execution (async)
    executor.execute().then(async (pipeline) => {
      // Update repository with pipeline results
      await supabase
        .from('micro_app_repositories')
        .update({
          status: pipeline.status === 'success' ? 'approved' : 'rejected',
          package_url: pipeline.status === 'success' ? context.artifacts.get('packageInfo')?.distUrl : null
        })
        .eq('id', repository.id);

      // If successful, publish package
      if (pipeline.status === 'success') {
        const packageInfo = context.artifacts.get('packageInfo');
        if (packageInfo) {
          await supabase
            .from('micro_app_packages')
            .insert({
              repository_id: repository.id,
              package_name: submissionData.technical.packageName,
              display_name: submissionData.appInfo.name,
              description: submissionData.appInfo.description,
              version: submissionData.technical.version,
              author_id: req.user.id,
              package_config: {
                entry: submissionData.technical.entryPoint
              },
              manifest: {
                name: submissionData.technical.packageName,
                version: submissionData.technical.version,
                license: submissionData.legal.license
              },
              dist_url: packageInfo.distUrl,
              dist_tarball_url: packageInfo.tarballUrl,
              dist_integrity_hash: packageInfo.integrityHash,
              dependencies: submissionData.technical.dependencies,
              compatible_brands: submissionData.appInfo.targetBrands,
              status: 'published',
              published_at: new Date().toISOString()
            });
        }
      }
    }).catch(error => {
      console.error('Pipeline execution error:', error);
    });

    res.status(202).json({
      message: 'Submission received and processing started',
      repositoryId: repository.id,
      pipelineId: context.artifacts.get('pipelineId')
    });

  } catch (error) {
    console.error('Submission processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get processing status
router.get('/submission/:repositoryId/status', authenticateDeveloper, async (req, res) => {
  try {
    const { repositoryId } = req.params;

    const { data: repository, error } = await supabase
      .from('micro_app_repositories')
      .select(`
        *,
        pipelines:deployment_pipelines(*)
      `)
      .eq('id', repositoryId)
      .single();

    if (error || !repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json({
      repository,
      latestPipeline: repository.pipelines?.[0] || null
    });

  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;