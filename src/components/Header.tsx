
import React from 'react';
import { Mail } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="py-6 mb-8">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center backdrop-blur-sm">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Email ISP Analyzer</h1>
              <p className="text-sm text-gray-500">Upload, analyze, and filter email data</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
