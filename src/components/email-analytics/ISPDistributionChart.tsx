
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartPie, BarChart2 } from 'lucide-react';
import { ISPCount } from '@/utils/emailUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ISPDistributionChartProps {
  ispCounts: ISPCount[];
  totalEmails: number;
}

const ISPDistributionChart: React.FC<ISPDistributionChartProps> = ({ ispCounts, totalEmails }) => {
  const [chartType, setChartType] = React.useState<'pie' | 'bar'>('pie');

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
                data={ispCounts.map(item => ({
                  ...item,
                  totalEmails
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
                {ispCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart
              data={ispCounts.map(item => ({
                ...item,
                totalEmails
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
                {ispCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ISPDistributionChart;
