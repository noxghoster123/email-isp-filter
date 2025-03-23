
import React from 'react';
import { MailCheck, MailX, MailQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { EmailProcessingResult } from '@/utils/emailUtils';

interface BounceStatusSectionProps {
  data: EmailProcessingResult;
  includeBounced: boolean;
  setIncludeBounced: (value: boolean) => void;
}

const BounceStatusSection: React.FC<BounceStatusSectionProps> = ({
  data,
  includeBounced,
  setIncludeBounced
}) => {
  // Calculate bounce status percentages
  const validPercent = (data.bounceStatus.valid / data.totalEmails) * 100;
  const bouncedPercent = (data.bounceStatus.bounced / data.totalEmails) * 100;
  const unknownPercent = (data.bounceStatus.unknown / data.totalEmails) * 100;

  return (
    <div className="card-glass rounded-xl p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Email Bounce Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MailCheck className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-sm font-medium">Valid</span>
            </div>
            <Badge variant="outline" className="bg-green-50">{data.bounceStatus.valid}</Badge>
          </div>
          <Progress value={validPercent} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MailX className="w-4 h-4 mr-2 text-red-500" />
              <span className="text-sm font-medium">Bounced</span>
            </div>
            <Badge variant="outline" className="bg-red-50">{data.bounceStatus.bounced}</Badge>
          </div>
          <Progress value={bouncedPercent} className="h-2 bg-gray-100" indicatorClassName="bg-red-500" />
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MailQuestion className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium">Unknown</span>
            </div>
            <Badge variant="outline" className="bg-gray-100">{data.bounceStatus.unknown}</Badge>
          </div>
          <Progress value={unknownPercent} className="h-2 bg-gray-100" indicatorClassName="bg-gray-400" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <Checkbox
          id="include-bounced"
          checked={includeBounced}
          onCheckedChange={(checked) => setIncludeBounced(checked as boolean)}
        />
        <label htmlFor="include-bounced" className="ml-2 text-sm cursor-pointer">
          Include bounced emails in filters and downloads
        </label>
      </div>
    </div>
  );
};

export default BounceStatusSection;
