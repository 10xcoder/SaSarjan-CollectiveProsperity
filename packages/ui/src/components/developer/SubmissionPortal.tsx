import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  Upload,
  Github,
  GitBranch,
  Package,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Code,
  FileText,
  Settings,
  Eye,
  Zap
} from 'lucide-react';
import { DeveloperSubmissionForm, Brand } from '@sasarjan/shared/types/developer';

interface SubmissionPortalProps {
  brands: Brand[];
  onSubmit: (submission: DeveloperSubmissionForm) => Promise<void>;
  onSaveDraft: (submission: Partial<DeveloperSubmissionForm>) => Promise<void>;
  existingDraft?: Partial<DeveloperSubmissionForm>;
  isLoading?: boolean;
}

export function SubmissionPortal({
  brands,
  onSubmit,
  onSaveDraft,
  existingDraft,
  isLoading = false
}: SubmissionPortalProps) {
  const [activeTab, setActiveTab] = useState('repository');
  const [securityScanStatus, setSecurityScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [testResults, setTestResults] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm<DeveloperSubmissionForm>({
    defaultValues: {
      repository: {
        url: existingDraft?.repository?.url || '',
        type: existingDraft?.repository?.type || 'github',
        branch: existingDraft?.repository?.branch || 'main',
        accessToken: existingDraft?.repository?.accessToken || ''
      },
      appInfo: {
        name: existingDraft?.appInfo?.name || '',
        description: existingDraft?.appInfo?.description || '',
        category: existingDraft?.appInfo?.category || '',
        targetBrands: existingDraft?.appInfo?.targetBrands || [],
        demoUrl: existingDraft?.appInfo?.demoUrl || '',
        documentationUrl: existingDraft?.appInfo?.documentationUrl || ''
      },
      technical: {
        packageName: existingDraft?.technical?.packageName || '',
        version: existingDraft?.technical?.version || '1.0.0',
        entryPoint: existingDraft?.technical?.entryPoint || 'dist/index.js',
        dependencies: existingDraft?.technical?.dependencies || {},
        permissions: existingDraft?.technical?.permissions || []
      },
      legal: {
        license: existingDraft?.legal?.license || 'MIT',
        termsAccepted: existingDraft?.legal?.termsAccepted || false,
        privacyPolicyUrl: existingDraft?.legal?.privacyPolicyUrl || '',
        dataProcessing: existingDraft?.legal?.dataProcessing || []
      },
      testing: {
        testResults: existingDraft?.testing?.testResults || [],
        coverageReport: existingDraft?.testing?.coverageReport,
        performanceMetrics: existingDraft?.testing?.performanceMetrics
      }
    }
  });

  const watchedRepository = watch('repository');
  const watchedTargetBrands = watch('appInfo.targetBrands');
  const watchedPermissions = watch('technical.permissions');

  const runSecurityScan = async () => {
    setSecurityScanStatus('scanning');
    
    try {
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSecurityScanStatus('complete');
    } catch (error) {
      setSecurityScanStatus('error');
    }
  };

  const runTests = async () => {
    try {
      // Simulate test run
      const mockResults = [
        { suite: 'Unit Tests', tests: 45, passes: 44, failures: 1, duration: 2341, coverage: 87 },
        { suite: 'Integration Tests', tests: 23, passes: 23, failures: 0, duration: 5432, coverage: 92 },
        { suite: 'E2E Tests', tests: 12, passes: 11, failures: 1, duration: 8765, coverage: 78 }
      ];
      setTestResults(mockResults);
      setValue('testing.testResults', mockResults);
    } catch (error) {
      console.error('Test execution failed:', error);
    }
  };

  const addPermission = (permission: string) => {
    if (!watchedPermissions.includes(permission)) {
      setValue('technical.permissions', [...watchedPermissions, permission]);
    }
  };

  const removePermission = (permission: string) => {
    setValue('technical.permissions', watchedPermissions.filter(p => p !== permission));
  };

  const addTargetBrand = (brandId: string) => {
    if (!watchedTargetBrands.includes(brandId)) {
      setValue('appInfo.targetBrands', [...watchedTargetBrands, brandId]);
    }
  };

  const removeTargetBrand = (brandId: string) => {
    setValue('appInfo.targetBrands', watchedTargetBrands.filter(b => b !== brandId));
  };

  const onFormSubmit = async (data: DeveloperSubmissionForm) => {
    await onSubmit(data);
  };

  const saveDraft = async () => {
    const currentData = watch();
    await onSaveDraft(currentData);
  };

  const availablePermissions = [
    'user.profile.read',
    'user.profile.write',
    'brand.config.read',
    'connections.create',
    'connections.read',
    'connections.update',
    'messaging.send',
    'messaging.read',
    'notifications.send',
    'analytics.read',
    'payments.create',
    'payments.read'
  ];

  const categories = [
    'two_sided_marketplace',
    'job_board',
    'learning_platform',
    'service_booking',
    'community',
    'content',
    'analytics',
    'integration'
  ];

  const licenses = [
    'MIT',
    'Apache-2.0',
    'GPL-3.0',
    'BSD-3-Clause',
    'ISC',
    'Proprietary'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Submit Your Micro-App</h1>
        <p className="text-muted-foreground">
          Deploy your micro-app to the SaSarjan ecosystem and reach thousands of users across multiple brands.
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${activeTab === 'repository' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium">Repository</span>
              </div>
              <div className={`flex items-center space-x-2 ${activeTab === 'app-info' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">App Info</span>
              </div>
              <div className={`flex items-center space-x-2 ${activeTab === 'technical' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <Code className="h-4 w-4" />
                <span className="text-sm font-medium">Technical</span>
              </div>
              <div className={`flex items-center space-x-2 ${activeTab === 'testing' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Testing</span>
              </div>
              <div className={`flex items-center space-x-2 ${activeTab === 'legal' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Legal</span>
              </div>
              <div className={`flex items-center space-x-2 ${activeTab === 'review' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Review</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={saveDraft} disabled={!isDirty}>
                Save Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            <TabsTrigger value="repository">Repository</TabsTrigger>
            <TabsTrigger value="app-info">App Info</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          {/* Repository Tab */}
          <TabsContent value="repository">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Repository Configuration
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="repository-type">Repository Type</Label>
                    <Controller
                      name="repository.type"
                      control={control}
                      rules={{ required: 'Repository type is required' }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="github">GitHub</SelectItem>
                            <SelectItem value="gitlab">GitLab</SelectItem>
                            <SelectItem value="bitbucket">Bitbucket</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.repository?.type && (
                      <p className="text-sm text-red-600">{errors.repository.type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repository-branch">Branch</Label>
                    <Controller
                      name="repository.branch"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="main"
                            className="pl-10"
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repository-url">Repository URL</Label>
                  <Controller
                    name="repository.url"
                    control={control}
                    rules={{ 
                      required: 'Repository URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL'
                      }
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="https://github.com/username/repository"
                          className="pl-10"
                        />
                      </div>
                    )}
                  />
                  {errors.repository?.url && (
                    <p className="text-sm text-red-600">{errors.repository.url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access-token">Access Token (for private repositories)</Label>
                  <Controller
                    name="repository.accessToken"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxx"
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required only for private repositories. Token should have read access to your repository.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('app-info')}
                    disabled={!watchedRepository.url}
                  >
                    Next: App Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Info Tab */}
          <TabsContent value="app-info">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Application Information
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-name">App Name</Label>
                    <Controller
                      name="appInfo.name"
                      control={control}
                      rules={{ required: 'App name is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="My Awesome Micro-App"
                        />
                      )}
                    />
                    {errors.appInfo?.name && (
                      <p className="text-sm text-red-600">{errors.appInfo.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-category">Category</Label>
                    <Controller
                      name="appInfo.category"
                      control={control}
                      rules={{ required: 'Category is required' }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.appInfo?.category && (
                      <p className="text-sm text-red-600">{errors.appInfo.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-description">Description</Label>
                  <Controller
                    name="appInfo.description"
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Describe what your micro-app does and how it helps users..."
                        className="min-h-[100px]"
                      />
                    )}
                  />
                  {errors.appInfo?.description && (
                    <p className="text-sm text-red-600">{errors.appInfo.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Target Brands</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {brands.map(brand => (
                      <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={watchedTargetBrands.includes(brand.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addTargetBrand(brand.id);
                            } else {
                              removeTargetBrand(brand.id);
                            }
                          }}
                        />
                        <Label className="text-sm">{brand.displayName}</Label>
                      </div>
                    ))}
                  </div>
                  {watchedTargetBrands.length === 0 && (
                    <p className="text-sm text-red-600">Please select at least one target brand</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-url">Demo URL (optional)</Label>
                    <Controller
                      name="appInfo.demoUrl"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="https://demo.example.com"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="docs-url">Documentation URL (optional)</Label>
                    <Controller
                      name="appInfo.documentationUrl"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="https://docs.example.com"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('repository')}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('technical')}
                  >
                    Next: Technical Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Technical Configuration
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="package-name">Package Name</Label>
                    <Controller
                      name="technical.packageName"
                      control={control}
                      rules={{ 
                        required: 'Package name is required',
                        pattern: {
                          value: /^@[a-z0-9-]+\/[a-z0-9-]+$/,
                          message: 'Package name must follow format @scope/name'
                        }
                      }}
                      render={({ field }) => (
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="@yourname/my-micro-app"
                            className="pl-10"
                          />
                        </div>
                      )}
                    />
                    {errors.technical?.packageName && (
                      <p className="text-sm text-red-600">{errors.technical.packageName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Controller
                      name="technical.version"
                      control={control}
                      rules={{ required: 'Version is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="1.0.0"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry-point">Entry Point</Label>
                  <Controller
                    name="technical.entryPoint"
                    control={control}
                    rules={{ required: 'Entry point is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="dist/index.js"
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Required Permissions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availablePermissions.map(permission => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          checked={watchedPermissions.includes(permission)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addPermission(permission);
                            } else {
                              removePermission(permission);
                            }
                          }}
                        />
                        <Label className="text-sm font-mono">{permission}</Label>
                      </div>
                    ))}
                  </div>
                  {watchedPermissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {watchedPermissions.map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('app-info')}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('testing')}
                  >
                    Next: Testing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Testing & Quality Assurance
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Security Scan */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Security Scan</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={runSecurityScan}
                      disabled={securityScanStatus === 'scanning'}
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      {securityScanStatus === 'scanning' ? 'Scanning...' : 'Run Security Scan'}
                    </Button>
                  </div>
                  
                  {securityScanStatus === 'scanning' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Running security scan...</span>
                    </div>
                  )}
                  
                  {securityScanStatus === 'complete' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Security scan passed - No critical vulnerabilities found</span>
                    </div>
                  )}
                  
                  {securityScanStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Security scan failed - Please review and fix issues</span>
                    </div>
                  )}
                </div>

                {/* Test Results */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Test Results</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={runTests}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Run Tests
                    </Button>
                  </div>
                  
                  {testResults.length > 0 && (
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{result.suite}</h4>
                            <Badge variant={result.failures === 0 ? "default" : "destructive"}>
                              {result.passes}/{result.tests} passed
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {result.duration}ms | Coverage: {result.coverage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('technical')}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('legal')}
                  >
                    Next: Legal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Legal & Compliance
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="license">License</Label>
                  <Controller
                    name="legal.license"
                    control={control}
                    rules={{ required: 'License is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {licenses.map(license => (
                            <SelectItem key={license} value={license}>
                              {license}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy-policy">Privacy Policy URL (optional)</Label>
                  <Controller
                    name="legal.privacyPolicyUrl"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="https://yoursite.com/privacy"
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Data Processing</Label>
                  <div className="space-y-2">
                    {[
                      'User Profile Data',
                      'Usage Analytics',
                      'Error Reporting',
                      'Performance Metrics',
                      'Communication Data'
                    ].map(dataType => (
                      <div key={dataType} className="flex items-center space-x-2">
                        <Checkbox
                          checked={watch('legal.dataProcessing')?.includes(dataType) || false}
                          onCheckedChange={(checked) => {
                            const current = watch('legal.dataProcessing') || [];
                            if (checked) {
                              setValue('legal.dataProcessing', [...current, dataType]);
                            } else {
                              setValue('legal.dataProcessing', current.filter(d => d !== dataType));
                            }
                          }}
                        />
                        <Label className="text-sm">{dataType}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Controller
                    name="legal.termsAccepted"
                    control={control}
                    rules={{ required: 'You must accept the terms and conditions' }}
                    render={({ field }) => (
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label className="text-sm leading-relaxed">
                          I agree to the{' '}
                          <a href="/developer-terms" target="_blank" className="text-blue-600 hover:underline">
                            Developer Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/platform-guidelines" target="_blank" className="text-blue-600 hover:underline">
                            Platform Guidelines
                          </a>
                        </Label>
                      </div>
                    )}
                  />
                  {errors.legal?.termsAccepted && (
                    <p className="text-sm text-red-600">{errors.legal.termsAccepted.message}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('testing')}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('review')}
                  >
                    Next: Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Review & Submit
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Submission Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">App Name:</span>
                        <span className="ml-2 font-medium">{watch('appInfo.name')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2 font-medium">{watch('appInfo.category')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Package:</span>
                        <span className="ml-2 font-medium">{watch('technical.packageName')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <span className="ml-2 font-medium">{watch('technical.version')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Automated security scan and dependency check</li>
                      <li>• Technical review by our team (2-3 business days)</li>
                      <li>• Community testing period (optional)</li>
                      <li>• Final approval and packaging</li>
                      <li>• Deployment to selected brands</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('legal')}
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="min-w-[150px]"
                  >
                    {isLoading ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}