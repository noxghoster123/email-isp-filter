
import React, { useState } from 'react';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader';
import EmailAnalytics from '@/components/EmailAnalytics';
import Header from '@/components/Header';
import { parseEmailFile, processEmails, EmailProcessingResult } from '@/utils/emailUtils';

const Index = () => {
  const [processingResult, setProcessingResult] = useState<EmailProcessingResult | null>(null);

  const handleFileLoaded = (content: string) => {
    try {
      const emailData = parseEmailFile(content);
      
      if (emailData.length === 0) {
        toast.error("No valid email data found in the file");
        return;
      }
      
      const result = processEmails(emailData);
      setProcessingResult(result);
      
      toast.success(`Successfully processed ${result.totalEmails} emails`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the file");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="container max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 gap-8">
          {!processingResult && (
            <div className="text-center my-8 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-2">Analyze Your Email Data</h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                Upload a text file containing email:password combinations to analyze and filter by ISP
              </p>
            </div>
          )}
          
          <div className={`${processingResult ? 'max-w-full' : 'max-w-xl mx-auto'}`}>
            <FileUploader onFileLoaded={handleFileLoaded} />
          </div>
          
          {processingResult && <EmailAnalytics data={processingResult} />}
          
          {!processingResult && (
            <div className="mt-8 max-w-xl mx-auto">
              <div className="card-glass rounded-xl p-6 text-sm text-gray-500 space-y-4">
                <h3 className="text-base font-medium text-gray-700">Expected File Format</h3>
                <p>Your text file should contain one email:password combination per line:</p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-xs">
                  example@gmail.com:password123<br />
                  test@yahoo.com:mypassword<br />
                  user@outlook.com:securepass
                </div>
                <p>
                  The app will extract emails, analyze their ISPs, and allow you to filter and 
                  download only the emails (without passwords) as a text file.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t bg-white/50 backdrop-blur-sm">
        <div className="container">
          <p>Email ISP Analyzer • Privacy focused • Data never leaves your browser</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
