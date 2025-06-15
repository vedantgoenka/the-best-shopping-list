
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Grid3X3, Store } from 'lucide-react';

interface GroupingToggleProps {
  groupBy: 'category' | 'shop';
  onGroupChange: (value: 'category' | 'shop') => void;
}

const GroupingToggle: React.FC<GroupingToggleProps> = ({ groupBy, onGroupChange }) => {
  const handleToggleChange = (checked: boolean) => {
    onGroupChange(checked ? 'shop' : 'category');
  };

  return (
    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 h-14">
      <div className="flex items-center gap-2">
        <Grid3X3 className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Category</span>
      </div>
      
      <div className="mx-4">
        <Switch
          checked={groupBy === 'shop'}
          onCheckedChange={handleToggleChange}
          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Shop</span>
        <Store className="h-4 w-4 text-gray-600" />
      </div>
    </div>
  );
};

export default GroupingToggle;
