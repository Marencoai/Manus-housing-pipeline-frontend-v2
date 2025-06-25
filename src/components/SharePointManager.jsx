import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ExternalLink, 
  Upload, 
  Users, 
  FolderPlus, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  Settings
} from 'lucide-react';

const SharePointManager = ({ project, onProjectUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [configStatus, setConfigStatus] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [folderPath, setFolderPath] = useState('');
  const [teamMemberEmail, setTeamMemberEmail] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  // Check SharePoint configuration on component mount
  useEffect(() => {
    checkSharePointConfig();
  }, []);

  const checkSharePointConfig = async () => {
    try {
      const response = await fetch(`${apiUrl}/sharepoint/config/check`);
      const data = await response.json();
      setConfigStatus(data);
    } catch (err) {
      console.error('Failed to check SharePoint config:', err);
    }
  };

  const createSharePointSite = async () => {
    if (!ownerUserId.trim()) {
      setError('Owner User ID is required to create SharePoint site');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiUrl}/sharepoint/projects/${project.id}/create-site`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_user_id: ownerUserId.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`SharePoint site created successfully! ${data.data.folders_created} folders created.`);
        // Update the project data in parent component
        if (onProjectUpdate) {
          onProjectUpdate({
            ...project,
            sharepoint_site_url: data.data.sharepoint_site_url,
            sharepoint_email: data.data.sharepoint_email,
            sharepoint_group_id: data.data.group_id
          });
        }
        setOwnerUserId('');
      } else {
        setError(data.error || 'Failed to create SharePoint site');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder_path', folderPath);

      const response = await fetch(`${apiUrl}/sharepoint/projects/${project.id}/upload-document`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Document "${data.data.file_name}" uploaded successfully!`);
        setUploadFile(null);
        setFolderPath('');
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to upload document');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async () => {
    if (!teamMemberEmail.trim()) {
      setError('Team member email/user ID is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiUrl}/sharepoint/projects/${project.id}/add-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: teamMemberEmail.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Team member added successfully!`);
        setTeamMemberEmail('');
      } else {
        setError(data.error || 'Failed to add team member');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasSharePointSite = project.sharepoint_site_url && project.sharepoint_site_url.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      {configStatus && (
        <Alert className={configStatus.configured ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>SharePoint Configuration:</strong> {configStatus.message}
            {!configStatus.configured && (
              <div className="mt-2 text-sm">
                Required environment variables: {configStatus.missing_variables?.join(', ')}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* SharePoint Site Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasSharePointSite ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            SharePoint Site Status
          </CardTitle>
          <CardDescription>
            {hasSharePointSite 
              ? 'SharePoint site is configured for this project'
              : 'No SharePoint site configured for this project'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasSharePointSite ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Site URL:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(project.sharepoint_site_url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Site
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Project Email:</span>
                <Badge variant="secondary">{project.sharepoint_email}</Badge>
              </div>
              {project.sharepoint_group_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Group ID:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {project.sharepoint_group_id}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-user-id">Owner User ID (Azure AD)</Label>
                <Input
                  id="owner-user-id"
                  placeholder="Enter Azure AD User ID (e.g., user@domain.com or GUID)"
                  value={ownerUserId}
                  onChange={(e) => setOwnerUserId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This user will be the owner of the SharePoint site and Microsoft 365 group
                </p>
              </div>
              <Button 
                onClick={createSharePointSite} 
                disabled={loading || !configStatus?.configured}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating SharePoint Site...
                  </>
                ) : (
                  <>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create SharePoint Site
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SharePoint Management Tabs - Only show if site exists */}
      {hasSharePointSite && (
        <Card>
          <CardHeader>
            <CardTitle>SharePoint Management</CardTitle>
            <CardDescription>
              Manage documents and team access for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="team">Team Access</TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload Document</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder-path">Folder Path (Optional)</Label>
                    <Input
                      id="folder-path"
                      placeholder="e.g., 01 - Project Planning"
                      value={folderPath}
                      onChange={(e) => setFolderPath(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to upload to root folder
                    </p>
                  </div>
                  <Button 
                    onClick={uploadDocument} 
                    disabled={loading || !uploadFile}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="team" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-member">Team Member (Azure AD User ID)</Label>
                    <Input
                      id="team-member"
                      placeholder="Enter user email or Azure AD User ID"
                      value={teamMemberEmail}
                      onChange={(e) => setTeamMemberEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      User will be added to the Microsoft 365 group and granted SharePoint access
                    </p>
                  </div>
                  <Button 
                    onClick={addTeamMember} 
                    disabled={loading || !teamMemberEmail.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Member...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Add Team Member
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SharePointManager;

