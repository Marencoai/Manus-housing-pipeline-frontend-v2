import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SharePointStatus from './SharePointStatus';
import SharePointManager from './SharePointManager';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const Projects = ({ apiUrl }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    total_units: '',
    affordable_units: '',
    total_cost: '',
    phase: 'Pre-Development',
    client_id: 1 // Default to first client for now
  });

  const phases = [
    'Pre-Development',
    'Application/Financing', 
    'Construction',
    'Lease-Up',
    'Operations'
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, filterPhase]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/projects`);
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPhase !== 'all') {
      filtered = filtered.filter(project => project.phase === filterPhase);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProject,
          total_units: parseInt(newProject.total_units),
          affordable_units: parseInt(newProject.affordable_units),
          total_cost: parseFloat(newProject.total_cost),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProjects([...projects, data.data]);
        setShowCreateModal(false);
        setNewProject({
          name: '',
          description: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          total_units: '',
          affordable_units: '',
          total_cost: '',
          phase: 'Pre-Development',
          client_id: 1
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectUpdate = (updatedProject) => {
    // Update the project in the projects list
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
    
    // Update the selected project if it's currently being viewed
    if (selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject(updatedProject);
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

  const getPhaseColor = (phase) => {
    const colors = {
      'Pre-Development': 'bg-gray-100 text-gray-800',
      'Application/Financing': 'bg-blue-100 text-blue-800',
      'Construction': 'bg-yellow-100 text-yellow-800',
      'Lease-Up': 'bg-purple-100 text-purple-800',
      'Operations': 'bg-green-100 text-green-800'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const ProjectCard = ({ project }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-brand-navy">{project.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              {project.city}, {project.state}
            </div>
          </div>
          <Badge className={getPhaseColor(project.phase)}>
            {project.phase}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-teal" />
              <span>{project.total_units} units</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-brand-red" />
              <span>{formatCurrency(project.total_cost)}</span>
            </div>
          </div>
          
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* SharePoint Status */}
          <SharePointStatus 
            project={project} 
            compact={true}
            onCreateSite={() => {
              setSelectedProject(project);
              setShowDetailsModal(true);
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              Created {new Date(project.created_at).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedProject(project);
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-2 text-gray-600">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your affordable housing development projects</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-brand-red hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newProject.address}
                    onChange={(e) => setNewProject({...newProject, address: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newProject.city}
                    onChange={(e) => setNewProject({...newProject, city: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newProject.state}
                    onChange={(e) => setNewProject({...newProject, state: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="total_units">Total Units</Label>
                  <Input
                    id="total_units"
                    type="number"
                    value={newProject.total_units}
                    onChange={(e) => setNewProject({...newProject, total_units: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="affordable_units">Affordable Units</Label>
                  <Input
                    id="affordable_units"
                    type="number"
                    value={newProject.affordable_units}
                    onChange={(e) => setNewProject({...newProject, affordable_units: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="total_cost">Total Cost</Label>
                  <Input
                    id="total_cost"
                    type="number"
                    step="0.01"
                    value={newProject.total_cost}
                    onChange={(e) => setNewProject({...newProject, total_cost: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phase">Phase</Label>
                  <Select value={newProject.phase} onValueChange={(value) => setNewProject({...newProject, phase: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {phases.map((phase) => (
                        <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white">
                  Create Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterPhase} onValueChange={setFilterPhase}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {phases.map((phase) => (
                    <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterPhase !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first project.'}
            </p>
            {!searchTerm && filterPhase === 'all' && (
              <Button 
                className="bg-brand-red hover:bg-red-700 text-white"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="sharepoint">SharePoint Integration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Project Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Location:</strong> {selectedProject.address}, {selectedProject.city}, {selectedProject.state}</div>
                      <div><strong>Phase:</strong> <Badge className={getPhaseColor(selectedProject.phase)}>{selectedProject.phase}</Badge></div>
                      <div><strong>Total Units:</strong> {selectedProject.total_units}</div>
                      <div><strong>Affordable Units:</strong> {selectedProject.affordable_units}</div>
                      <div><strong>Total Cost:</strong> {formatCurrency(selectedProject.total_cost)}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Financial Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Funding Secured:</strong> {formatCurrency(selectedProject.funding_secured)}</div>
                      <div><strong>Funding Gap:</strong> {formatCurrency(selectedProject.funding_gap)}</div>
                      <div><strong>Progress:</strong> {selectedProject.total_cost > 0 ? Math.round((selectedProject.funding_secured / selectedProject.total_cost) * 100) : 0}%</div>
                    </div>
                  </div>
                </div>
                
                {selectedProject.description && (
                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Description</h3>
                    <p className="text-sm text-gray-600">{selectedProject.description}</p>
                  </div>
                )}

                {/* SharePoint Status Overview */}
                <div>
                  <h3 className="font-semibold text-brand-navy mb-3">SharePoint Integration</h3>
                  <SharePointStatus 
                    project={selectedProject} 
                    compact={false}
                    onCreateSite={() => {
                      // Switch to SharePoint tab when creating site
                      const sharepointTab = document.querySelector('[value="sharepoint"]');
                      if (sharepointTab) sharepointTab.click();
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="sharepoint" className="space-y-6">
                <SharePointManager 
                  project={selectedProject} 
                  onProjectUpdate={handleProjectUpdate}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;

