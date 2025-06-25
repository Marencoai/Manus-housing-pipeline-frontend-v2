import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  FolderPlus,
  FileText,
  Users
} from 'lucide-react';

const SharePointStatus = ({ project, onCreateSite, compact = false }) => {
  const hasSharePointSite = project.sharepoint_site_url && project.sharepoint_site_url.trim() !== '';

  if (compact) {
    // Compact version for project cards
    return (
      <div className="flex items-center gap-2">
        {hasSharePointSite ? (
          <>
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              SharePoint
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(project.sharepoint_site_url, '_blank')}
              className="h-6 px-2"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            No SharePoint
          </Badge>
        )}
      </div>
    );
  }

  // Full version for detailed views
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasSharePointSite ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <span className="font-medium">
            {hasSharePointSite ? 'SharePoint Integrated' : 'SharePoint Not Configured'}
          </span>
        </div>
        
        {hasSharePointSite ? (
          <div className="flex items-center gap-2">
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
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateSite}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Create Site
          </Button>
        )}
      </div>

      {hasSharePointSite && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <FileText className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium">Document Library</div>
              <div className="text-xs text-muted-foreground">Organized folders</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Users className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-medium">Team Access</div>
              <div className="text-xs text-muted-foreground">Collaborative workspace</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <ExternalLink className="h-4 w-4 text-purple-600" />
            <div>
              <div className="font-medium">Project Email</div>
              <div className="text-xs text-muted-foreground font-mono">
                {project.sharepoint_email}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePointStatus;

