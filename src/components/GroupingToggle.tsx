
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid3X3, Store } from 'lucide-react';

interface GroupingToggleProps {
  currentGroup: 'category' | 'shop';
  onGroupChange: (value: 'category' | 'shop') => void;
}

const GroupingToggle: React.FC<GroupingToggleProps> = ({ currentGroup, onGroupChange }) => {
  return (
    <div className="flex justify-center mb-4 sm:mb-6">
      <ToggleGroup 
        type="single" 
        value={currentGroup} 
        onValueChange={(value) => {
          if (value) {
            onGroupChange(value as 'category' | 'shop');
          }
        }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-1"
      >
        <ToggleGroupItem 
          value="category" 
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base"
        >
          <Grid3X3 className="h-4 w-4" />
          Category
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="shop" 
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base"
        >
          <Store className="h-4 w-4" />
          Shop
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default GroupingToggle;
