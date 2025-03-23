
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { filterEmailsByISP, downloadAsTextFile, EmailProcessingResult } from '@/utils/emailUtils';
import BounceStatusSection from './email-analytics/BounceStatusSection';
import ISPDistributionChart from './email-analytics/ISPDistributionChart';
import ISPFilterSection from './email-analytics/ISPFilterSection';

interface EmailAnalyticsProps {
  data: EmailProcessingResult | null;
}

const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ data }) => {
  const [selectedISPs, setSelectedISPs] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [includeBounced, setIncludeBounced] = useState(true);

  useEffect(() => {
    if (data) {
      const filtered = filterEmailsByISP(data.allEmails, selectedISPs, includeBounced);
      setFilteredEmails(filtered);
    }
  }, [data, selectedISPs, includeBounced]);

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

  return (
    <div className="w-full animate-fade-in">
      <BounceStatusSection 
        data={data} 
        includeBounced={includeBounced} 
        setIncludeBounced={setIncludeBounced} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <ISPDistributionChart 
          ispCounts={data.ispCounts} 
          totalEmails={data.totalEmails} 
        />
        
        <ISPFilterSection 
          ispCounts={data.ispCounts}
          totalEmails={data.totalEmails}
          selectedISPs={selectedISPs}
          filteredEmails={filteredEmails}
          onISPToggle={handleISPToggle}
          onSelectAll={handleSelectAll}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default EmailAnalytics;
