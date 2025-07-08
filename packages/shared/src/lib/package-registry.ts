// Micro-App Package Registry System
import { 
  MicroAppPackage, 
  PackageVersion, 
  PackageSearchFilters, 
  PackageSearchResult,
  PackageInstallOptions,
  PackageInstallResult,
  DeveloperSubmissionForm
} from '../types/developer';

interface RegistryConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

interface BuildConfig {
  nodeVersion: string;
  buildCommands: string[];
  outputDir: string;
  entryPoint: string;
  skipTests?: boolean;
}

interface PackageMetadata {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  license: string;
  repository: {
    type: string;
    url: string;
  };
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  sasarjan?: {
    category: string;
    microAppType: string;
    permissions: string[];
    compatibleBrands: string[];
  };
}

export class MicroAppPackageRegistry {
  private config: RegistryConfig;
  private cache: Map<string, MicroAppPackage> = new Map();

  constructor(config: RegistryConfig) {
    this.config = config;
  }

  // Package Discovery
  async searchPackages(filters: PackageSearchFilters): Promise<PackageSearchResult> {
    const queryParams = new URLSearchParams();
    
    if (filters.query) queryParams.set('q', filters.query);
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.brand) queryParams.set('brand', filters.brand);
    if (filters.author) queryParams.set('author', filters.author);
    if (filters.isTemplate !== undefined) queryParams.set('template', filters.isTemplate.toString());
    if (filters.isFeatured !== undefined) queryParams.set('featured', filters.isFeatured.toString());
    if (filters.minQualityScore) queryParams.set('quality', filters.minQualityScore.toString());
    if (filters.license?.length) queryParams.set('license', filters.license.join(','));
    if (filters.tags?.length) queryParams.set('tags', filters.tags.join(','));
    if (filters.sort) queryParams.set('sort', filters.sort);
    if (filters.limit) queryParams.set('limit', filters.limit.toString());
    if (filters.offset) queryParams.set('offset', filters.offset.toString());

    const response = await this.apiRequest(`/packages/search?${queryParams.toString()}`);
    return response.json();
  }

  async getPackage(packageName: string): Promise<MicroAppPackage | null> {
    // Check cache first
    if (this.cache.has(packageName)) {
      return this.cache.get(packageName)!;
    }

    try {
      const response = await this.apiRequest(`/packages/${encodeURIComponent(packageName)}`);
      if (response.status === 404) return null;
      
      const packageData = await response.json();
      this.cache.set(packageName, packageData);
      return packageData;
    } catch (error) {
      console.error(`Error fetching package ${packageName}:`, error);
      return null;
    }
  }

  async getPackageVersions(packageName: string): Promise<PackageVersion[]> {
    const response = await this.apiRequest(`/packages/${encodeURIComponent(packageName)}/versions`);
    return response.json();
  }

  async getPackageVersion(packageName: string, version: string): Promise<PackageVersion | null> {
    try {
      const response = await this.apiRequest(
        `/packages/${encodeURIComponent(packageName)}/versions/${encodeURIComponent(version)}`
      );
      if (response.status === 404) return null;
      return response.json();
    } catch (error) {
      console.error(`Error fetching package version ${packageName}@${version}:`, error);
      return null;
    }
  }

  // Package Installation
  async installPackage(
    packageName: string, 
    options: PackageInstallOptions = {}
  ): Promise<PackageInstallResult> {
    const version = options.version || 'latest';
    const environment = options.environment || 'production';

    // Validate package exists
    const packageInfo = await this.getPackage(packageName);
    if (!packageInfo) {
      return {
        success: false,
        packageId: '',
        version: '',
        installPath: '',
        dependencies: [],
        errors: [`Package ${packageName} not found`]
      };
    }

    // Get specific version
    const packageVersion = await this.getPackageVersion(packageName, version);
    if (!packageVersion) {
      return {
        success: false,
        packageId: packageInfo.id,
        version: '',
        installPath: '',
        dependencies: [],
        errors: [`Version ${version} not found for package ${packageName}`]
      };
    }

    try {
      // Download and install package
      const installPath = await this.downloadPackage(packageVersion);
      const dependencies = await this.resolveDependencies(packageVersion);
      
      // Install dependencies
      for (const dep of dependencies) {
        await this.installDependency(dep);
      }

      // Apply customizations if provided
      if (options.customizations) {
        await this.applyCustomizations(installPath, options.customizations);
      }

      // Configure enabled modules
      if (options.enabledModules) {
        await this.configureModules(installPath, options.enabledModules);
      }

      // Update install metrics
      await this.updateInstallMetrics(packageInfo.id);

      return {
        success: true,
        packageId: packageInfo.id,
        version: packageVersion.version,
        installPath,
        dependencies: dependencies.map(d => d.name)
      };
    } catch (error) {
      return {
        success: false,
        packageId: packageInfo.id,
        version: packageVersion.version,
        installPath: '',
        dependencies: [],
        errors: [error instanceof Error ? error.message : 'Installation failed']
      };
    }
  }

  // Package Publishing (for approved submissions)
  async publishPackage(
    submissionData: DeveloperSubmissionForm,
    buildArtifacts: {
      distUrl: string;
      tarballUrl: string;
      integrityHash: string;
      sizeBytes: number;
    }
  ): Promise<MicroAppPackage> {
    const packageMetadata: PackageMetadata = {
      name: submissionData.technical.packageName,
      version: submissionData.technical.version,
      description: submissionData.appInfo.description,
      keywords: [submissionData.appInfo.category],
      license: submissionData.legal.license,
      repository: {
        type: submissionData.repository.type,
        url: submissionData.repository.url
      },
      dependencies: submissionData.technical.dependencies,
      sasarjan: {
        category: submissionData.appInfo.category,
        microAppType: submissionData.appInfo.category,
        permissions: submissionData.technical.permissions,
        compatibleBrands: submissionData.appInfo.targetBrands
      }
    };

    const packageData = {
      packageName: submissionData.technical.packageName,
      displayName: submissionData.appInfo.name,
      description: submissionData.appInfo.description,
      version: submissionData.technical.version,
      packageConfig: {
        entry: submissionData.technical.entryPoint,
        types: submissionData.technical.entryPoint.replace('.js', '.d.ts')
      },
      manifest: packageMetadata,
      distUrl: buildArtifacts.distUrl,
      distTarballUrl: buildArtifacts.tarballUrl,
      distIntegrityHash: buildArtifacts.integrityHash,
      dependencies: submissionData.technical.dependencies,
      compatibleBrands: submissionData.appInfo.targetBrands,
      status: 'published' as const
    };

    const response = await this.apiRequest('/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData)
    });

    const publishedPackage = await response.json();
    
    // Update cache
    this.cache.set(publishedPackage.packageName, publishedPackage);
    
    return publishedPackage;
  }

  // Dependency Resolution
  private async resolveDependencies(packageVersion: PackageVersion): Promise<Array<{name: string, version: string}>> {
    const dependencies: Array<{name: string, version: string}> = [];
    
    // Process runtime dependencies
    if (packageVersion.dependencies) {
      for (const [name, versionRange] of Object.entries(packageVersion.dependencies)) {
        const resolvedVersion = await this.resolveVersionRange(name, versionRange);
        if (resolvedVersion) {
          dependencies.push({ name, version: resolvedVersion });
        }
      }
    }

    // Process peer dependencies
    if (packageVersion.peerDependencies) {
      for (const [name, versionRange] of Object.entries(packageVersion.peerDependencies)) {
        const resolvedVersion = await this.resolveVersionRange(name, versionRange);
        if (resolvedVersion) {
          dependencies.push({ name, version: resolvedVersion });
        }
      }
    }

    return dependencies;
  }

  private async resolveVersionRange(packageName: string, versionRange: string): Promise<string | null> {
    try {
      const versions = await this.getPackageVersions(packageName);
      
      // Simple version resolution (in production, use semver library)
      if (versionRange === 'latest' || versionRange === '*') {
        const latestVersion = versions.find(v => v.isLatest);
        return latestVersion?.version || null;
      }

      // Exact version match
      const exactMatch = versions.find(v => v.version === versionRange);
      if (exactMatch) {
        return exactMatch.version;
      }

      // For now, return latest if no exact match
      const latestVersion = versions.find(v => v.isLatest);
      return latestVersion?.version || null;
    } catch (error) {
      console.error(`Error resolving version for ${packageName}:`, error);
      return null;
    }
  }

  private async downloadPackage(packageVersion: PackageVersion): Promise<string> {
    // In production, this would download the package to a local directory
    // For now, return the dist URL as the install path
    return packageVersion.distUrl;
  }

  private async installDependency(dependency: {name: string, version: string}): Promise<void> {
    // Install dependency package
    await this.installPackage(dependency.name, { version: dependency.version });
  }

  private async applyCustomizations(installPath: string, customizations: Record<string, any>): Promise<void> {
    // Apply customizations to the installed package
    console.log(`Applying customizations to ${installPath}:`, customizations);
  }

  private async configureModules(installPath: string, enabledModules: string[]): Promise<void> {
    // Configure which modules are enabled for this installation
    console.log(`Configuring modules for ${installPath}:`, enabledModules);
  }

  private async updateInstallMetrics(packageId: string): Promise<void> {
    // Update download/install metrics
    await this.apiRequest(`/packages/${packageId}/metrics/install`, {
      method: 'POST'
    });
  }

  // Utility methods
  private async apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.config.baseUrl}${path}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Accept': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        ...options.headers
      },
      timeout: this.config.timeout || 30000
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`Registry API error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Package Builder for processing submissions
export class MicroAppPackageBuilder {
  private buildConfig: BuildConfig;

  constructor(buildConfig: BuildConfig) {
    this.buildConfig = buildConfig;
  }

  async buildPackage(
    repositoryUrl: string,
    branch: string = 'main',
    accessToken?: string
  ): Promise<{
    success: boolean;
    distUrl?: string;
    tarballUrl?: string;
    integrityHash?: string;
    sizeBytes?: number;
    logs?: string;
    errors?: string[];
  }> {
    try {
      // 1. Clone repository
      const repoPath = await this.cloneRepository(repositoryUrl, branch, accessToken);
      
      // 2. Install dependencies
      await this.installDependencies(repoPath);
      
      // 3. Run build commands
      const buildLogs = await this.runBuildCommands(repoPath);
      
      // 4. Package output
      const packageInfo = await this.packageOutput(repoPath);
      
      // 5. Upload to CDN
      const uploadResult = await this.uploadPackage(packageInfo);
      
      return {
        success: true,
        ...uploadResult,
        logs: buildLogs
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Build failed'],
        logs: error instanceof Error ? error.stack : undefined
      };
    }
  }

  private async cloneRepository(url: string, branch: string, accessToken?: string): Promise<string> {
    // Implementation would use git clone
    console.log(`Cloning repository: ${url} (branch: ${branch})`);
    return `/tmp/build-${Date.now()}`;
  }

  private async installDependencies(repoPath: string): Promise<void> {
    // Run npm/yarn/pnpm install
    console.log(`Installing dependencies in ${repoPath}`);
  }

  private async runBuildCommands(repoPath: string): Promise<string> {
    let logs = '';
    
    for (const command of this.buildConfig.buildCommands) {
      console.log(`Running: ${command}`);
      logs += `$ ${command}\n`;
      // Execute command and capture output
    }
    
    return logs;
  }

  private async packageOutput(repoPath: string): Promise<{
    outputPath: string;
    sizeBytes: number;
    files: string[];
  }> {
    const outputPath = `${repoPath}/${this.buildConfig.outputDir}`;
    
    return {
      outputPath,
      sizeBytes: 1024 * 1024, // Placeholder
      files: ['index.js', 'index.d.ts'] // Placeholder
    };
  }

  private async uploadPackage(packageInfo: {
    outputPath: string;
    sizeBytes: number;
    files: string[];
  }): Promise<{
    distUrl: string;
    tarballUrl: string;
    integrityHash: string;
    sizeBytes: number;
  }> {
    // Upload to CDN and return URLs
    const packageId = `pkg-${Date.now()}`;
    
    return {
      distUrl: `https://cdn.sasarjan.com/packages/${packageId}/index.js`,
      tarballUrl: `https://cdn.sasarjan.com/packages/${packageId}/package.tgz`,
      integrityHash: 'sha256-' + 'placeholder-hash',
      sizeBytes: packageInfo.sizeBytes
    };
  }
}

// Registry CLI for developers
export class RegistryCLI {
  private registry: MicroAppPackageRegistry;

  constructor(registry: MicroAppPackageRegistry) {
    this.registry = registry;
  }

  async search(query: string): Promise<void> {
    const results = await this.registry.searchPackages({ query, limit: 20 });
    
    console.log(`Found ${results.totalCount} packages:\n`);
    
    for (const pkg of results.packages) {
      console.log(`${pkg.packageName}@${pkg.version}`);
      console.log(`  ${pkg.description}`);
      console.log(`  Downloads: ${pkg.totalDownloads} | Quality: ${pkg.qualityScore}/5.0`);
      console.log('');
    }
  }

  async install(packageName: string, version?: string): Promise<void> {
    console.log(`Installing ${packageName}${version ? `@${version}` : ''}...`);
    
    const result = await this.registry.installPackage(packageName, { version });
    
    if (result.success) {
      console.log(`✓ Successfully installed ${packageName}@${result.version}`);
      if (result.dependencies.length > 0) {
        console.log(`  Dependencies: ${result.dependencies.join(', ')}`);
      }
    } else {
      console.error(`✗ Installation failed:`);
      result.errors?.forEach(error => console.error(`  ${error}`));
    }
  }

  async info(packageName: string): Promise<void> {
    const pkg = await this.registry.getPackage(packageName);
    
    if (!pkg) {
      console.error(`Package ${packageName} not found`);
      return;
    }

    console.log(`${pkg.packageName}@${pkg.version}`);
    console.log(`  ${pkg.description}`);
    console.log(`  License: ${pkg.manifest.license}`);
    console.log(`  Author: ${pkg.authorId}`);
    console.log(`  Downloads: ${pkg.totalDownloads}`);
    console.log(`  Quality Score: ${pkg.qualityScore}/5.0`);
    console.log(`  Compatible Brands: ${pkg.compatibleBrands.join(', ')}`);
    console.log(`  Published: ${pkg.publishedAt}`);
  }
}