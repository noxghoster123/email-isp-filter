
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartPie, BarChart2, Filter, Download } from 'lucide-react';
import { ISPCount, filterEmailsByISP, downloadAsTextFile, EmailProcessingResult } from '@/utils/emailUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';

interface EmailAnalyticsProps {
  data: EmailProcessingResult | null;
}

const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ data }) => {
  const [selectedISPs, setSelectedISPs] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  useEffect(() => {
    if (data) {
      if (selectedISPs.length === 0) {
        setFilteredEmails(data.filteredEmails);
      } else {
        const filtered = filterEmailsByISP(data.allEmails, selectedISPs);
        setFilteredEmails(filtered);
      }
    }
  }, [data, selectedISPs]);

  const handleISPToggle = (isp: string) => {
    setSelectedISPs(prev => {
      if (prev.includes(isp)) {
        return prev.filter(item => item !== isp);
      } else {
        return [...prev, isp];
      }
    });
  };

  const handleDownload = () => {
    if (filteredEmails.length === 0) {
      toast.error("No emails to download");
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
    const filename = `filtered_emails_${timestamp}.txt`;
    downloadAsTextFile(filteredEmails, filename);
    
    toast.success(`${filteredEmails.length} emails downloaded`);
  };

  const handleSelectAll = () => {
    if (data) {
      if (selectedISPs.length === data.ispCounts.length) {
        setSelectedISPs([]);
      } else {
        setSelectedISPs(data.ispCounts.map(isp => isp.name));
      }
    }
  };

  if (!data) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-700">{data.count} emails</p>
          <p className="text-sm text-gray-500">
            {((data.count / data.totalEmails) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="md:col-span-2 card-glass rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">ISP Distribution</h3>
            <Tabs defaultValue="pie" className="w-[180px]" onValueChange={(v) => setChartType(v as 'pie' | 'bar')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pie" className="flex items-center">
                  <ChartPie className="w-4 h-4 mr-2" />
                  Pie
                </TabsTrigger>
                <TabsTrigger value="bar" className="flex items-center">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Bar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={data.ispCounts.map(item => ({
                      ...item,
                      totalEmails: data.totalEmails
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                    animationDuration={800}
                    animationBegin={200}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    labelLine={false}
                  >
                    {data.ispCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <BarChart
                  data={data.ispCounts.map(item => ({
                    ...item,
                    totalEmails: data.totalEmails
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    name="Emails"
                    animationDuration={800}
                  >
                    {data.ispCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card-glass rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter ISPs
            </h3>
            <button 
              onClick={handleSelectAll}
              className="text-xs text-primary hover:underline"
            >
              {selectedISPs.length === data.ispCounts.length ? 'Clear All' : 'Select All'}
            </button>
          </div>
          
          <div className="space-y-3 mt-4 max-h-[230px] overflow-y-auto pr-2">
            {data.ispCounts.map(isp => (
              <div key={isp.name} className="flex items-center space-x-3">
                <Checkbox
                  id={`isp-${isp.name}`}
                  checked={selectedISPs.includes(isp.name)}
                  onCheckedChange={() => handleISPToggle(isp.name)}
                />
                <label
                  htmlFor={`isp-${isp.name}`}
                  className="text-sm font-medium flex items-center justify-between w-full cursor-pointer"
                >
                  <div className="flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: isp.color }}
                    ></span>
                    <span className="capitalize">{isp.name}</span>
                  </div>
                  <Badge variant="outline" className="ml-2">{isp.count}</Badge>
                </label>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">
                {selectedISPs.length === 0 
                  ? `All ${data.totalEmails} emails selected` 
                  : `${filteredEmails.length} of ${data.totalEmails} emails selected`}
              </span>
            </div>
            <button
              onClick={handleDownload}
              className="w-full btn-primary flex items-center justify-center"
              disabled={filteredEmails.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download emails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAnalytics;
