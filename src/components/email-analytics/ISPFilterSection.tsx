
import React from 'react';
import { Filter, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ISPCount } from '@/utils/emailUtils';

interface ISPFilterSectionProps {
  ispCounts: ISPCount[];
  totalEmails: number;
  selectedISPs: string[];
  filteredEmails: string[];
  onISPToggle: (isp: string) => void;
  onSelectAll: () => void;
  onDownload: () => void;
}

const ISPFilterSection: React.FC<ISPFilterSectionProps> = ({
  ispCounts,
  totalEmails,
  selectedISPs,
  filteredEmails,
  onISPToggle,
  onSelectAll,
  onDownload
}) => {
  return (
    <div className="card-glass rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter ISPs
        </h3>
        <button 
          onClick={onSelectAll}
          className="text-xs text-primary hover:underline"
        >
          {selectedISPs.length === ispCounts.length ? 'Clear All' : 'Select All'}
        </button>
      </div>
      
      <div className="space-y-3 mt-4 max-h-[230px] overflow-y-auto pr-2">
        {ispCounts.map(isp => (
          <div key={isp.name} className="flex items-center space-x-3">
            <Checkbox
              id={`isp-${isp.name}`}
              checked={selectedISPs.includes(isp.name)}
              onCheckedChange={() => onISPToggle(isp.name)}
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
              ? `All ${filteredEmails.length} emails selected` 
              : `${filteredEmails.length} of ${totalEmails} emails selected`}
          </span>
        </div>
        <button
          onClick={onDownload}
          className="w-full btn-primary flex items-center justify-center"
          disabled={filteredEmails.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Download emails
        </button>
      </div>
    </div>
  );
};

export default ISPFilterSection;
