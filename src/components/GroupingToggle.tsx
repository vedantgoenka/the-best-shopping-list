
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Grid3X3, Store } from 'lucide-react';

interface GroupingToggleProps {
  groupBy: 'category' | 'shop';
  onGroupChange: (value: 'category' | 'shop') => void;
}

const GroupingToggle: React.FC<GroupingToggleProps> = ({ groupBy, onGroupChange }) => {
  return (
    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-1 h-14">
      <div className="flex items-center gap-2 px-4 py-2">
        <Grid3X3 className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Category</span>
      </div>
      
      <RadioGroup 
        value={groupBy} 
        onValueChange={(value) => onGroupChange(value as 'category' | 'shop')}
        className="flex items-center gap-1 mx-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="category" id="category" className="border-2" />
          <div className="w-8 h-1 bg-gray-200 rounded-full">
            <div 
              className={`w-4 h-1 bg-blue-600 rounded-full transition-transform duration-200 ${
                groupBy === 'shop' ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <RadioGroupItem value="shop" id="shop" className="border-2" />
        </div>
      </RadioGroup>
      
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-sm font-medium text-gray-700">Shop</span>
        <Store className="h-4 w-4 text-gray-600" />
      </div>
    </div>
  );
};

export default GroupingToggle;
