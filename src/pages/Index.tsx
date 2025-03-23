
import React, { useState } from 'react';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader';
import EmailAnalytics from '@/components/EmailAnalytics';
import Header from '@/components/Header';
import { parseEmailFile, processEmails, EmailProcessingResult } from '@/utils/emailUtils';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [processingResult, setProcessingResult] = useState<EmailProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileLoaded = async (content: string) => {
    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      setProcessingStatus('Parsing email data...');
      
      const emailData = parseEmailFile(content);
      
      if (emailData.length === 0) {
        toast.error("No valid email data found in the file");
        setIsProcessing(false);
        return;
      }
      
      toast.info(`Processing ${emailData.length} emails and checking bounce status...`);
      setProcessingStatus(`Preparing to check ${emailData.length} emails...`);
      
      const result = await processEmails(emailData, (progress, status) => {
        setProcessingProgress(progress);
        setProcessingStatus(status);
      });
      
      setProcessingResult(result);
      
      const validCount = result.bounceStatus.valid;
      const bouncedCount = result.bounceStatus.bounced;
      
      toast.success(
        `Processed ${result.totalEmails} emails: ${validCount} valid, ${bouncedCount} bounced`
      );
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the file");
    } finally {
      setIsProcessing(false);
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
                Upload a text file containing email:password combinations to analyze validity, bouncing status, and filter by ISP
              </p>
            </div>
          )}
          
          <div className={`${processingResult ? 'max-w-full' : 'max-w-xl mx-auto'}`}>
            <FileUploader 
              onFileLoaded={handleFileLoaded}
              isDisabled={isProcessing}
            />
            
            {isProcessing && (
              <div className="mt-6 text-center">
                <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin-slow"></div>
                <p className="mt-3 text-gray-600">{processingStatus}</p>
                <div className="mt-4 w-full max-w-md mx-auto">
                  <Progress 
                    value={processingProgress} 
                    className="h-2 bg-gray-100" 
                    indicatorClassName="bg-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">{processingProgress}% complete</p>
                </div>
              </div>
            )}
          </div>
          
          {processingResult && <EmailAnalytics data={processingResult} />}
          
          {!processingResult && !isProcessing && (
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
                  The app will extract emails, check for bouncing, analyze their ISPs, and allow you to filter and 
                  download only the valid emails as a text file.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t bg-white/50 backdrop-blur-sm">
        <div className="container">
          <p>Email ISP Analyzer • Bounce checking • Privacy focused • Data never leaves your browser</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
