
import React from 'react';
import { Filter, Grid3X3, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface FilterControlsProps {
  groupBy: 'category' | 'shop';
  showCompleted: boolean;
  onGroupChange: (groupBy: 'category' | 'shop') => void;
  onShowCompletedChange: (show: boolean) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  groupBy,
  showCompleted,
  onGroupChange,
  onShowCompletedChange,
}) => {
  const handleToggleChange = (checked: boolean) => {
    onGroupChange(checked ? 'shop' : 'category');
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
        <span className="text-xs sm:text-sm font-medium text-gray-700">Category</span>
      </div>
      
      <Switch
        checked={groupBy === 'shop'}
        onCheckedChange={handleToggleChange}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
      />
      
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm font-medium text-gray-700">Shop</span>
        <Store className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
      </div>
      
      <Button
        variant={showCompleted ? "default" : "outline"}
        size="icon"
        onClick={() => onShowCompletedChange(!showCompleted)}
        className="h-8 w-8 sm:h-10 sm:w-10 ml-auto"
        title={showCompleted ? 'Hide completed items' : 'Show completed items'}
      >
        <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default FilterControls;
