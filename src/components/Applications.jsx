import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Download
} from 'lucide-react';

const Applications = ({ apiUrl }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [fundingSources, setFundingSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [newApplication, setNewApplication] = useState({
    project_id: '',
    funding_source_id: '',
    amount_requested: '',
    application_deadline: '',
    status: 'Draft',
    notes: ''
  });

  const statuses = [
    'Draft',
    'Submitted', 
    'Under Review',
    'Approved',
    'Rejected',
    'Awarded'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, filterStatus, filterSource]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const appResponse = await fetch(`${apiUrl}/applications`);
      const appData = await appResponse.json();
      
      // Fetch projects for dropdown
      const projectResponse = await fetch(`${apiUrl}/projects`);
      const projectData = await projectResponse.json();
      
      // Fetch funding sources for dropdown
      const fundingResponse = await fetch(`${apiUrl}/funding-sources`);
      const fundingData = await fundingResponse.json();
      
      if (appData.success) setApplications(appData.data);
      if (projectData.success) setProjects(projectData.data);
      if (fundingData.success) setFundingSources(fundingData.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.funding_source_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(app => app.funding_source_id === parseInt(filterSource));
    }

    setFilteredApplications(filtered);
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newApplication,
          project_id: parseInt(newApplication.project_id),
          funding_source_id: parseInt(newApplication.funding_source_id),
          amount_requested: parseFloat(newApplication.amount_requested),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchData(); // Refresh the list
        setShowCreateModal(false);
        setNewApplication({
          project_id: '',
          funding_source_id: '',
          amount_requested: '',
          application_deadline: '',
          status: 'Draft',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error creating application:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Awarded': 'bg-brand-teal text-white'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft': return <Edit className="h-4 w-4" />;
      case 'Submitted': return <FileText className="h-4 w-4" />;
      case 'Under Review': return <Clock className="h-4 w-4" />;
      case 'Approved': return <CheckCircle className="h-4 w-4" />;
      case 'Rejected': return <AlertCircle className="h-4 w-4" />;
      case 'Awarded': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ApplicationCard = ({ application }) => {
    const daysUntilDeadline = getDaysUntilDeadline(application.application_deadline);
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg text-brand-navy">{application.project_name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <DollarSign className="h-4 w-4" />
                {application.funding_source_name}
              </div>
            </div>
            <Badge className={getStatusColor(application.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(application.status)}
                {application.status}
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Amount Requested:</span>
                <div className="font-semibold text-brand-navy">
                  {formatCurrency(application.amount_requested)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Deadline:</span>
                <div className="font-semibold">
                  {formatDate(application.application_deadline)}
                </div>
                {daysUntilDeadline >= 0 && (
                  <div className={`text-xs ${daysUntilDeadline <= 7 ? 'text-red-600' : 'text-gray-500'}`}>
                    {daysUntilDeadline === 0 ? 'Due today' : 
                     daysUntilDeadline === 1 ? '1 day left' : 
                     `${daysUntilDeadline} days left`}
                  </div>
                )}
              </div>
            </div>

            {application.notes && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {application.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500">
                Created {formatDate(application.created_at)}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowDetailsModal(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-brand-blue-gray text-brand-blue-gray hover:bg-brand-blue-gray hover:text-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-2 text-gray-600">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Applications</h1>
          <p className="text-gray-600 mt-1">Track funding applications across all sources</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-brand-red hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_id">Project</Label>
                  <Select value={newApplication.project_id} onValueChange={(value) => setNewApplication({...newApplication, project_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="funding_source_id">Funding Source</Label>
                  <Select value={newApplication.funding_source_id} onValueChange={(value) => setNewApplication({...newApplication, funding_source_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      {fundingSources.map((source) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount_requested">Amount Requested</Label>
                  <Input
                    id="amount_requested"
                    type="number"
                    step="0.01"
                    value={newApplication.amount_requested}
                    onChange={(e) => setNewApplication({...newApplication, amount_requested: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={newApplication.application_deadline}
                    onChange={(e) => setNewApplication({...newApplication, application_deadline: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newApplication.status} onValueChange={(value) => setNewApplication({...newApplication, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newApplication.notes}
                    onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white">
                  Create Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-brand-navy">{applications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {applications.filter(app => app.status === 'Approved' || app.status === 'Awarded').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {applications.filter(app => app.status === 'Under Review' || app.status === 'Submitted').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-teal">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requested</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {formatCurrency(applications.reduce((sum, app) => sum + (app.amount_requested || 0), 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-brand-teal" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {fundingSources.map((source) => (
                    <SelectItem key={source.id} value={source.id.toString()}>{source.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      {filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No applications found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterSource !== 'all'
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first application.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterSource === 'all' && (
              <Button 
                className="bg-brand-red hover:bg-red-700 text-white"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Application
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-brand-navy mb-3">Application Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Project:</strong> {selectedApplication.project_name}</div>
                    <div><strong>Funding Source:</strong> {selectedApplication.funding_source_name}</div>
                    <div><strong>Amount Requested:</strong> {formatCurrency(selectedApplication.amount_requested)}</div>
                    <div><strong>Status:</strong> <Badge className={getStatusColor(selectedApplication.status)}>{selectedApplication.status}</Badge></div>
                    <div><strong>Deadline:</strong> {formatDate(selectedApplication.application_deadline)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Created:</strong> {formatDate(selectedApplication.created_at)}</div>
                    <div><strong>Last Updated:</strong> {formatDate(selectedApplication.updated_at)}</div>
                    {selectedApplication.application_deadline && (
                      <div><strong>Days Until Deadline:</strong> {getDaysUntilDeadline(selectedApplication.application_deadline)}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedApplication.notes && (
                <div>
                  <h3 className="font-semibold text-brand-navy mb-3">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedApplication.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;

