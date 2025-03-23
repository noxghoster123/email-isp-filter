
type EmailData = {
  email: string;
  password: string;
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
        emailData.push({ email, password });
      }
    }
  });

  return emailData;
};

export const processEmails = (emailData: EmailData[]): EmailProcessingResult => {
  const ispCounts: Record<string, number> = {};
  const filteredEmails: string[] = [];
  
  emailData.forEach(({ email }) => {
    const isp = getISPFromEmail(email);
    ispCounts[isp] = (ispCounts[isp] || 0) + 1;
    filteredEmails.push(email);
  });
  
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
    allEmails: emailData
  };
};

export const filterEmailsByISP = (
  emailData: EmailData[], 
  selectedISPs: string[]
): string[] => {
  if (!selectedISPs.length) return emailData.map(data => data.email);
  
  return emailData
    .filter(({ email }) => selectedISPs.includes(getISPFromEmail(email)))
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
