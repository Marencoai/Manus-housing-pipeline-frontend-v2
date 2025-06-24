import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  Plus, 
  Play,
  Pause,
  Square,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Timer
} from 'lucide-react';

const TimeTracking = ({ apiUrl }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [newEntry, setNewEntry] = useState({
    project_id: '',
    task_description: '',
    hours: '',
    hourly_rate: '125',
    date: new Date().toISOString().split('T')[0],
    billable: true,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!activeTimer && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerSeconds]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [entriesResponse, projectsResponse] = await Promise.all([
        fetch(`${apiUrl}/time-entries`),
        fetch(`${apiUrl}/projects`)
      ]);
      
      const entriesData = await entriesResponse.json();
      const projectsData = await projectsResponse.json();
      
      if (entriesData.success) setTimeEntries(entriesData.data);
      if (projectsData.success) setProjects(projectsData.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEntry,
          project_id: parseInt(newEntry.project_id),
          hours: parseFloat(newEntry.hours),
          hourly_rate: parseFloat(newEntry.hourly_rate),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchData();
        setShowCreateModal(false);
        setNewEntry({
          project_id: '',
          task_description: '',
          hours: '',
          hourly_rate: '125',
          date: new Date().toISOString().split('T')[0],
          billable: true,
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error creating time entry:', error);
    }
  };

  const startTimer = (projectId) => {
    setActiveTimer(projectId);
    setTimerSeconds(0);
  };

  const stopTimer = () => {
    if (activeTimer && timerSeconds > 0) {
      const hours = (timerSeconds / 3600).toFixed(2);
      setNewEntry({
        ...newEntry,
        project_id: activeTimer.toString(),
        hours: hours,
        task_description: 'Timer session'
      });
      setShowCreateModal(true);
    }
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  const totalBillable = timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + ((entry.hours || 0) * (entry.hourly_rate || 0)), 0);
  const thisWeekEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  const TimeEntryCard = ({ entry }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-brand-navy">{entry.project_name}</h3>
            <p className="text-sm text-gray-600 mt-1">{entry.task_description}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-brand-navy">{entry.hours}h</div>
            <div className="text-sm text-gray-500">{formatDate(entry.date)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-brand-teal" />
              <span>{formatCurrency(entry.hourly_rate)}/hr</span>
            </div>
            <Badge variant={entry.billable ? "default" : "secondary"}>
              {entry.billable ? 'Billable' : 'Non-billable'}
            </Badge>
          </div>
          <div className="font-semibold text-brand-navy">
            {formatCurrency((entry.hours || 0) * (entry.hourly_rate || 0))}
          </div>
        </div>

        {entry.notes && (
          <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
            {entry.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-2 text-gray-600">Loading time entries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Track time and manage billing for projects</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-brand-red hover:bg-red-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project_id">Project</Label>
                    <Select value={newEntry.project_id} onValueChange={(value) => setNewEntry({...newEntry, project_id: value})}>
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
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.25"
                      value={newEntry.hours}
                      onChange={(e) => setNewEntry({...newEntry, hours: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      value={newEntry.hourly_rate}
                      onChange={(e) => setNewEntry({...newEntry, hourly_rate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="task_description">Task Description</Label>
                    <Input
                      id="task_description"
                      value={newEntry.task_description}
                      onChange={(e) => setNewEntry({...newEntry, task_description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="billable"
                        checked={newEntry.billable}
                        onChange={(e) => setNewEntry({...newEntry, billable: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="billable">Billable</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white">
                    Add Entry
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-brand-red" />
            Active Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-mono font-bold text-brand-navy">
                {formatTime(timerSeconds)}
              </div>
              {activeTimer && (
                <div className="text-sm text-gray-600">
                  Project: {projects.find(p => p.id === activeTimer)?.name || 'Unknown'}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!activeTimer ? (
                <Select onValueChange={(value) => startTimer(parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select project to start timer" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Button
                  onClick={stopTimer}
                  className="bg-brand-red hover:bg-red-700 text-white"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop & Save
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-teal">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-brand-navy">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-brand-teal" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Billable</p>
                <p className="text-2xl font-bold text-brand-navy">{formatCurrency(totalBillable)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {thisWeekEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0).toFixed(1)}h
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rate</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {formatCurrency(totalHours > 0 ? totalBillable / totalHours : 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Time Entries</CardTitle>
            <Button variant="outline" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {timeEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeEntries.slice(0, 9).map((entry) => (
                <TimeEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No time entries yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your time to manage billing and productivity.</p>
              <Button 
                className="bg-brand-red hover:bg-red-700 text-white"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracking;

