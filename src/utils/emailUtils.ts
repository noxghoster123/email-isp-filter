type EmailData = {
  email: string;
  password: string;
  bounceStatus?: 'valid' | 'bounced' | 'unknown';
};

export type ISPCount = {
  name: string;
  count: number;
  color: string;
};

export type EmailProcessingResult = {
  ispCounts: ISPCount[];
  totalEmails: number;
  filteredEmails: string[];
  allEmails: EmailData[];
  bounceStatus: {
    valid: number;
    bounced: number;
    unknown: number;
  };
};

// ISP color mapping for consistent colors in the chart
const ispColors: Record<string, string> = {
  gmail: "#DB4437",
  outlook: "#0072C6",
  yahoo: "#720E9E",
  hotmail: "#00A4EF",
  aol: "#FF0000",
  icloud: "#999999",
  protonmail: "#8A2BE2",
  zoho: "#F48024",
  other: "#6E7780"
};

export const getISPFromEmail = (email: string): string => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) return 'invalid';
  
  if (domain.includes('gmail')) return 'gmail';
  if (domain.includes('outlook') || domain.includes('live') || domain.includes('msn')) return 'outlook';
  if (domain.includes('yahoo')) return 'yahoo';
  if (domain.includes('hotmail')) return 'hotmail';
  if (domain.includes('aol')) return 'aol';
  if (domain.includes('icloud') || domain.includes('me.com') || domain.includes('mac.com')) return 'icloud';
  if (domain.includes('protonmail') || domain.includes('pm.me')) return 'protonmail';
  if (domain.includes('zoho')) return 'zoho';
  
  return 'other';
};

export const getColorForISP = (isp: string): string => {
  return ispColors[isp.toLowerCase()] || ispColors.other;
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const parseEmailFile = (content: string): EmailData[] => {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  const emailData: EmailData[] = [];

  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const email = parts[0].trim();
      const password = parts.slice(1).join(':').trim();
      
      if (validateEmail(email)) {
        emailData.push({ 
          email, 
          password,
          bounceStatus: 'unknown' 
        });
      }
    }
  });

  return emailData;
};

export const checkEmailBounce = async (email: string): Promise<'valid' | 'bounced' | 'unknown'> => {
  // In a real application, this would connect to an email verification API
  // For demonstration purposes, we'll simulate results based on patterns
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Deterministic simulation based on email characteristics
    // This is just for demonstration - in a real app you'd call an actual API
    if (email.includes('bounce') || email.includes('invalid') || email.includes('test')) {
      return 'bounced';
    }
    
    // Simple hash-based simulation to get consistent but distributed results
    const emailHash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Make most emails valid, but some bounced for demo purposes
    return emailHash % 10 === 0 ? 'bounced' : 'valid';
  } catch (error) {
    console.error("Error checking email bounce status:", error);
    return 'unknown';
  }
};

export const processEmails = async (
  emailData: EmailData[],
  onProgress?: (progress: number, status: string) => void
): Promise<EmailProcessingResult> => {
  const ispCounts: Record<string, number> = {};
  const filteredEmails: string[] = [];
  const bounceStatus = { valid: 0, bounced: 0, unknown: 0 };
  
  // First pass - count ISPs
  emailData.forEach(({ email }) => {
    const isp = getISPFromEmail(email);
    ispCounts[isp] = (ispCounts[isp] || 0) + 1;
    filteredEmails.push(email);
  });
  
  // Second pass - check bounce status (in batches to avoid rate limiting)
  const batchSize = 10;
  const updatedEmailData = [...emailData];
  const totalEmails = updatedEmailData.length;

  for (let i = 0; i < updatedEmailData.length; i += batchSize) {
    const batch = updatedEmailData.slice(i, i + batchSize);
    
    // Process batch in parallel
    await Promise.all(batch.map(async (data, index) => {
      const status = await checkEmailBounce(data.email);
      updatedEmailData[i + index].bounceStatus = status;
      bounceStatus[status] += 1;
      
      // Report progress
      if (onProgress) {
        const processedCount = Math.min(i + index + 1, totalEmails);
        const progressPercent = Math.floor((processedCount / totalEmails) * 100);
        onProgress(progressPercent, `Checking email ${processedCount}/${totalEmails}`);
      }
    }));
  }
  
  const result: ISPCount[] = Object.entries(ispCounts)
    .map(([name, count]) => ({
      name,
      count,
      color: getColorForISP(name)
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    ispCounts: result,
    totalEmails: emailData.length,
    filteredEmails,
    allEmails: updatedEmailData,
    bounceStatus
  };
};

export const filterEmailsByISP = (
  emailData: EmailData[], 
  selectedISPs: string[],
  includeBounced: boolean = false
): string[] => {
  if (!selectedISPs.length && includeBounced) {
    return emailData.map(data => data.email);
  }
  
  return emailData
    .filter(({ email, bounceStatus }) => {
      const ispMatch = selectedISPs.length === 0 || selectedISPs.includes(getISPFromEmail(email));
      const bounceMatch = includeBounced || bounceStatus !== 'bounced';
      return ispMatch && bounceMatch;
    })
    .map(data => data.email);
};

export const downloadAsTextFile = (data: string[], filename: string): void => {
  const content = data.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
