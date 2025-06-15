
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid3X3, Store } from 'lucide-react';

interface GroupingToggleProps {
  groupBy: 'category' | 'shop';
  onGroupChange: (value: 'category' | 'shop') => void;
}

const GroupingToggle: React.FC<GroupingToggleProps> = ({ groupBy, onGroupChange }) => {
  return (
    <ToggleGroup 
      type="single" 
      value={groupBy} 
      onValueChange={(value) => {
        if (value) {
          onGroupChange(value as 'category' | 'shop');
        }
      }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 h-9"
    >
      <ToggleGroupItem 
        value="category" 
        className="flex items-center gap-2 px-3 py-1 text-sm h-7"
      >
        <Grid3X3 className="h-4 w-4" />
        Category
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="shop" 
        className="flex items-center gap-2 px-3 py-1 text-sm h-7"
      >
        <Store className="h-4 w-4" />
        Shop
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default GroupingToggle;
