import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Building2,
  FileText,
  Calendar,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const FundingSources = ({ apiUrl }) => {
  const [fundingSources, setFundingSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFundingSources();
  }, []);

  const fetchFundingSources = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/funding-sources`);
      const data = await response.json();
      
      if (data.success) {
        setFundingSources(data.data);
      }
    } catch (error) {
      console.error('Error fetching funding sources:', error);
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

  const getSourceTypeColor = (type) => {
    const colors = {
      'Federal': 'bg-blue-100 text-blue-800',
      'State': 'bg-green-100 text-green-800',
      'Local': 'bg-purple-100 text-purple-800',
      'Private': 'bg-orange-100 text-orange-800',
      'Tax Credit': 'bg-brand-teal text-white',
      'Congressional': 'bg-brand-red text-white'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityIcon = (available) => {
    return available ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-500" />
    );
  };

  const FundingSourceCard = ({ source }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-brand-navy">{source.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getSourceTypeColor(source.type)}>
                {source.type}
              </Badge>
              <div className="flex items-center gap-1">
                {getAvailabilityIcon(source.currently_available)}
                <span className="text-sm text-gray-600">
                  {source.currently_available ? 'Available' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {source.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {source.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Typical Amount:</span>
              <div className="font-semibold text-brand-navy">
                {source.typical_amount_min && source.typical_amount_max 
                  ? `${formatCurrency(source.typical_amount_min)} - ${formatCurrency(source.typical_amount_max)}`
                  : source.typical_amount_min 
                    ? `${formatCurrency(source.typical_amount_min)}+`
                    : 'Varies'
                }
              </div>
            </div>
            <div>
              <span className="text-gray-500">Applications:</span>
              <div className="font-semibold text-brand-navy">
                {source.application_count || 0} submitted
              </div>
            </div>
          </div>

          {source.application_deadline && (
            <div className="text-sm">
              <span className="text-gray-500">Next Deadline:</span>
              <div className="font-semibold text-brand-navy">
                {new Date(source.application_deadline).toLocaleDateString()}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              {source.application_frequency || 'Annual'} applications
            </div>
            <div className="flex gap-2">
              {source.website_url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                  onClick={() => window.open(source.website_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="border-brand-blue-gray text-brand-blue-gray hover:bg-brand-blue-gray hover:text-white"
              >
                <FileText className="h-4 w-4" />
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
        <span className="ml-2 text-gray-600">Loading funding sources...</span>
      </div>
    );
  }

  const availableSources = fundingSources.filter(source => source.currently_available);
  const totalApplications = fundingSources.reduce((sum, source) => sum + (source.application_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Funding Sources</h1>
          <p className="text-gray-600 mt-1">Track and manage all available funding opportunities</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-teal">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sources</p>
                <p className="text-2xl font-bold text-brand-navy">{fundingSources.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-brand-teal" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently Available</p>
                <p className="text-2xl font-bold text-brand-navy">{availableSources.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications Submitted</p>
                <p className="text-2xl font-bold text-brand-navy">{totalApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {totalApplications > 0 ? Math.round((availableSources.length / totalApplications) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Funding Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brand-red" />
            The 7 Core Funding Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'LIHTC 9%', type: 'Tax Credit', description: 'Low-Income Housing Tax Credits - Competitive 9% program', available: true },
              { name: 'FHLB AHP', type: 'Federal', description: 'Federal Home Loan Bank Affordable Housing Program', available: true },
              { name: 'ORCA', type: 'State', description: 'Oregon Residential and Community Action funding', available: true },
              { name: 'HOME Program', type: 'Federal', description: 'HOME Investment Partnerships Program', available: true },
              { name: 'PDLP', type: 'State', description: 'Predevelopment Loan Program', available: true },
              { name: 'Business Oregon', type: 'State', description: 'State economic development grants', available: true },
              { name: 'Congressional CIP', type: 'Congressional', description: 'Congressional Community Investment Program', available: true }
            ].map((source, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-brand-navy">{source.name}</h3>
                  <Badge className={getSourceTypeColor(source.type)}>
                    {source.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                <div className="flex items-center gap-1">
                  {getAvailabilityIcon(source.available)}
                  <span className="text-sm text-gray-600">
                    {source.available ? 'Available' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Funding Sources */}
      {fundingSources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundingSources.map((source) => (
            <FundingSourceCard key={source.id} source={source} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No funding sources configured</h3>
            <p className="text-gray-500 mb-4">
              Funding sources will be automatically populated based on your project requirements.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-brand-red hover:bg-red-700 text-white">
              <FileText className="mr-2 h-4 w-4" />
              New Application
            </Button>
            <Button variant="outline" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              View Deadlines
            </Button>
            <Button variant="outline" className="border-brand-blue-gray text-brand-blue-gray hover:bg-brand-blue-gray hover:text-white">
              <TrendingUp className="mr-2 h-4 w-4" />
              Success Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundingSources;

