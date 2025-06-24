import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Calendar
} from 'lucide-react';

const Dashboard = ({ apiUrl }) => {
  const [stats, setStats] = useState(null);
  const [applicationStats, setApplicationStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch project stats
      const projectResponse = await fetch(`${apiUrl}/projects/dashboard-stats`);
      const projectData = await projectResponse.json();
      
      // Fetch application stats
      const appResponse = await fetch(`${apiUrl}/applications/dashboard-stats`);
      const appData = await appResponse.json();
      
      // Fetch recent projects
      const recentResponse = await fetch(`${apiUrl}/projects?limit=5`);
      const recentData = await recentResponse.json();
      
      if (projectData.success) setStats(projectData.data);
      if (appData.success) setApplicationStats(appData.data);
      if (recentData.success) setRecentProjects(recentData.data.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Draft': { variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      'Submitted': { variant: 'default', className: 'bg-blue-100 text-blue-800' },
      'Under Review': { variant: 'default', className: 'bg-yellow-100 text-yellow-800' },
      'Approved': { variant: 'default', className: 'bg-green-100 text-green-800' },
      'Rejected': { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      'Awarded': { variant: 'default', className: 'bg-brand-teal text-white' },
    };
    
    const config = statusConfig[status] || statusConfig['Draft'];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'Pre-Development': return <Clock className="h-4 w-4" />;
      case 'Application/Financing': return <FileText className="h-4 w-4" />;
      case 'Construction': return <Building2 className="h-4 w-4" />;
      case 'Lease-Up': return <Users className="h-4 w-4" />;
      case 'Operations': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue-gray rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Housing Pipeline Pro</h1>
        <p className="text-blue-100 text-lg">
          Managing {stats?.total_projects || 0} projects across 7 funding sources with 
          {applicationStats ? ` ${applicationStats.total_applications} active applications` : ' comprehensive tracking'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-brand-red">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            <Building2 className="h-5 w-5 text-brand-red" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-navy">{stats?.total_projects || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Active developments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-teal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Funding Secured</CardTitle>
            <DollarSign className="h-5 w-5 text-brand-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-navy">
              {formatCurrency(stats?.financial_summary?.total_funding_secured)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Across all projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-navy">
              {applicationStats?.total_applications || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {applicationStats?.success_rate || 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Funding Gap</CardTitle>
            <Target className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-navy">
              {formatCurrency(stats?.financial_summary?.total_funding_gap)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Remaining to secure</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Phase Distribution & Application Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-teal" />
              Project Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.phase_distribution && Object.entries(stats.phase_distribution).map(([phase, count]) => (
                <div key={phase} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPhaseIcon(phase)}
                    <span className="text-sm font-medium">{phase}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-teal h-2 rounded-full" 
                        style={{ 
                          width: `${stats.total_projects > 0 ? (count / stats.total_projects) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-brand-navy w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-red" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicationStats?.status_distribution && Object.entries(applicationStats.status_distribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-red h-2 rounded-full" 
                        style={{ 
                          width: `${applicationStats.total_applications > 0 ? (count / applicationStats.total_applications) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-brand-navy w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-navy" />
            Recent Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-navy">{project.name}</h3>
                    <p className="text-sm text-gray-600">
                      {project.city}, {project.state} • {project.total_units} units
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getPhaseIcon(project.phase)}
                      <span className="text-xs text-gray-500">{project.phase}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-navy">
                      {formatCurrency(project.funding_secured)}
                    </div>
                    <div className="text-sm text-gray-600">
                      of {formatCurrency(project.total_cost)}
                    </div>
                    {project.funding_gap > 0 && (
                      <div className="text-xs text-yellow-600 mt-1">
                        {formatCurrency(project.funding_gap)} gap
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No projects found. Create your first project to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-brand-red hover:bg-red-700 text-white">
              <Building2 className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
              <FileText className="mr-2 h-4 w-4" />
              New Application
            </Button>
            <Button variant="outline" className="border-brand-blue-gray text-brand-blue-gray hover:bg-brand-blue-gray hover:text-white">
              <Clock className="mr-2 h-4 w-4" />
              Track Time
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

