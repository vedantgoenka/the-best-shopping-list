
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressBannerProps {
  totalItems: number;
  completedItems: number;
  progressPercentage: number;
}

const ProgressBanner: React.FC<ProgressBannerProps> = ({
  totalItems,
  completedItems,
  progressPercentage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-16 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex-1 mr-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="pb-4 text-center animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your Shopping Progress</h2>
            {totalItems === 0 ? (
              <p className="text-gray-600">Your list is empty - time to add some items!</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">
                  {completedItems} of {totalItems} items completed
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(progressPercentage)}% complete
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBanner;
