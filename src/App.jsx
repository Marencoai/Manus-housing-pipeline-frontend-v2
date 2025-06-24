import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Applications from './components/Applications';
import Clients from './components/Clients';
import FundingSources from './components/FundingSources';
import TimeTracking from './components/TimeTracking';
import AIChat from './components/AIChat';

// Icons
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Users, 
  DollarSign, 
  Clock, 
  MessageCircle,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use Railway backend URL with forced HTTPS
  const apiUrl = 'https://thriving-playfulness-production.up.railway.app/api';

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, component: Dashboard },
    { id: 'projects', name: 'Projects', icon: Building2, component: Projects },
    { id: 'applications', name: 'Applications', icon: FileText, component: Applications },
    { id: 'clients', name: 'Clients', icon: Users, component: Clients },
    { id: 'funding', name: 'Funding Sources', icon: DollarSign, component: FundingSources },
    { id: 'time', name: 'Time Tracking', icon: Clock, component: TimeTracking },
    { id: 'ai', name: 'AI Assistant', icon: MessageCircle, component: AIChat },
  ];

  const ActiveComponent = navigation.find(nav => nav.id === activeTab)?.component || Dashboard;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 bg-brand-navy border-b border-brand-blue-gray">
            <h1 className="text-xl font-bold text-white">Housing Pipeline Pro</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-brand-red text-white border-r-4 border-brand-teal'
                      : 'text-gray-300 hover:bg-brand-blue-gray hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <span className="text-sm font-medium text-gray-700">
                  Affordable Housing Management System
                </span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ActiveComponent apiUrl={apiUrl} />
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

