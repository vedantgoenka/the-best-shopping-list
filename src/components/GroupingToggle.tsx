
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
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-1 h-14"
    >
      <ToggleGroupItem 
        value="category" 
        className="flex items-center gap-2 px-4 py-2 text-sm h-12 rounded-lg"
      >
        <Grid3X3 className="h-4 w-4" />
        Category
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="shop" 
        className="flex items-center gap-2 px-4 py-2 text-sm h-12 rounded-lg"
      >
        <Store className="h-4 w-4" />
        Shop
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default GroupingToggle;
