'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Camera,
  FileText,
  MapPin,
  Calendar,
  Users,
  Award,
  Download,
  QrCode
} from 'lucide-react'

interface ServiceVerificationProps {
  onClose: () => void
}

interface VerificationRequest {
  eventTitle: string
  organization: string
  date: string
  duration: string
  location: string
  description: string
  impact: string
  volunteerRole: string
  supervisorName: string
  supervisorEmail: string
  supervisorPhone: string
  photos: File[]
  documents: File[]
}

interface VerificationRecord {
  id: string
  eventTitle: string
  organization: string
  date: string
  duration: string
  status: 'pending' | 'verified' | 'rejected'
  certificateUrl?: string
  verifiedBy?: string
  verificationDate?: string
  impact: string
}

const mockVerifications: VerificationRecord[] = [
  {
    id: '1',
    eventTitle: 'Food Distribution Drive',
    organization: 'Mumbai Food Bank',
    date: '2024-12-01',
    duration: '4 hours',
    status: 'verified',
    certificateUrl: '/certificates/food-drive-cert.pdf',
    verifiedBy: 'Supervisor Name',
    verificationDate: '2024-12-03',
    impact: 'Fed 200+ families'
  },
  {
    id: '2',
    eventTitle: 'Tree Plantation Drive',
    organization: 'Green Mumbai Initiative',
    date: '2024-11-28',
    duration: '6 hours',
    status: 'pending',
    impact: 'Planted 50+ trees'
  },
  {
    id: '3',
    eventTitle: 'Digital Literacy Training',
    organization: 'Tech for Good Foundation',
    date: '2024-11-20',
    duration: '3 hours',
    status: 'verified',
    certificateUrl: '/certificates/digital-literacy-cert.pdf',
    verifiedBy: 'Training Coordinator',
    verificationDate: '2024-11-22',
    impact: 'Trained 15 seniors'
  }
]

export function ServiceVerification({ onClose }: ServiceVerificationProps) {
  const [activeTab, setActiveTab] = useState('submit')
  const [verificationData, setVerificationData] = useState<VerificationRequest>({
    eventTitle: '',
    organization: '',
    date: '',
    duration: '',
    location: '',
    description: '',
    impact: '',
    volunteerRole: '',
    supervisorName: '',
    supervisorEmail: '',
    supervisorPhone: '',
    photos: [],
    documents: []
  })

  const [submissions] = useState<VerificationRecord[]>(mockVerifications)

  const handleInputChange = (field: keyof VerificationRequest, value: string) => {
    setVerificationData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: 'photos' | 'documents', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setVerificationData(prev => ({ ...prev, [field]: [...prev[field], ...fileArray] }))
    }
  }

  const removeFile = (field: 'photos' | 'documents', index: number) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    console.log('Submitting verification request:', verificationData)
    // Here you would typically submit to a backend API
    onClose()
  }

  const downloadCertificate = (certificateUrl: string) => {
    // In a real app, this would download the certificate
    console.log('Downloading certificate:', certificateUrl)
  }

  const generateQRCode = (recordId: string) => {
    // Generate QR code for verification
    console.log('Generating QR code for record:', recordId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Service Verification</CardTitle>
            <CardDescription>
              Submit volunteer work for verification and manage your service certificates
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'submit'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Submit for Verification
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Verification Status
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'certificates'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            My Certificates
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          <CardContent className="p-6">
            {activeTab === 'submit' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle">Event/Activity Title *</Label>
                    <Input
                      id="eventTitle"
                      value={verificationData.eventTitle}
                      onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                      placeholder="e.g., Food Distribution Drive"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization *</Label>
                    <Input
                      id="organization"
                      value={verificationData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      placeholder="e.g., Mumbai Food Bank"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date of Service *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={verificationData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      value={verificationData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 4 hours"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={verificationData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Address or area where you volunteered"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="volunteerRole">Your Role/Responsibilities *</Label>
                    <Input
                      id="volunteerRole"
                      value={verificationData.volunteerRole}
                      onChange={(e) => handleInputChange('volunteerRole', e.target.value)}
                      placeholder="e.g., Food distribution, crowd management"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description of Work *</Label>
                    <Textarea
                      id="description"
                      value={verificationData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what you did during your volunteer work..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="impact">Impact/Outcome</Label>
                    <Input
                      id="impact"
                      value={verificationData.impact}
                      onChange={(e) => handleInputChange('impact', e.target.value)}
                      placeholder="e.g., Fed 200+ families, Taught 15 students"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Supervisor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supervisorName">Supervisor Name *</Label>
                      <Input
                        id="supervisorName"
                        value={verificationData.supervisorName}
                        onChange={(e) => handleInputChange('supervisorName', e.target.value)}
                        placeholder="Name of supervising person"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supervisorEmail">Supervisor Email *</Label>
                      <Input
                        id="supervisorEmail"
                        type="email"
                        value={verificationData.supervisorEmail}
                        onChange={(e) => handleInputChange('supervisorEmail', e.target.value)}
                        placeholder="supervisor@organization.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supervisorPhone">Supervisor Phone</Label>
                      <Input
                        id="supervisorPhone"
                        value={verificationData.supervisorPhone}
                        onChange={(e) => handleInputChange('supervisorPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Supporting Documents</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Photos from the Event</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload photos showing your participation in the volunteer activity
                      </p>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload('photos', e.target.files)}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Photos
                            </span>
                          </Button>
                        </label>
                      </div>
                      
                      {verificationData.photos.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {verificationData.photos.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile('photos', index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Additional Documents</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload any certificates, letters, or documents related to your service
                      </p>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          multiple
                          onChange={(e) => handleFileUpload('documents', e.target.files)}
                          className="hidden"
                          id="document-upload"
                        />
                        <label htmlFor="document-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Documents
                            </span>
                          </Button>
                        </label>
                      </div>
                      
                      {verificationData.documents.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {verificationData.documents.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile('documents', index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'status' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Verification Requests</h3>
                  <p className="text-muted-foreground">
                    Track the status of your submitted verification requests
                  </p>
                </div>

                {submissions.map((submission) => (
                  <Card key={submission.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{submission.eventTitle}</h4>
                          <p className="text-sm text-muted-foreground">{submission.organization}</p>
                        </div>
                        <Badge className={`${getStatusColor(submission.status)} flex items-center gap-1`}>
                          {getStatusIcon(submission.status)}
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(submission.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{submission.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>{submission.impact}</span>
                        </div>
                        {submission.verificationDate && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Verified {new Date(submission.verificationDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {submission.status === 'verified' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadCertificate(submission.certificateUrl!)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Certificate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateQRCode(submission.id)}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Get QR Code
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Verified Certificates</h3>
                  <p className="text-muted-foreground">
                    Download and share your verified volunteer service certificates
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissions
                    .filter(s => s.status === 'verified')
                    .map((cert) => (
                      <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Award className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{cert.eventTitle}</h4>
                                <p className="text-sm text-muted-foreground">{cert.organization}</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>

                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date:</span>
                              <span>{new Date(cert.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span>{cert.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Impact:</span>
                              <span>{cert.impact}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Verified by:</span>
                              <span>{cert.verifiedBy}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => downloadCertificate(cert.certificateUrl!)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateQRCode(cert.id)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {activeTab === 'submit' && (
          <div className="border-t p-6 flex gap-4 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Submit for Verification
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}