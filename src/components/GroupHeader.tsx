
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import CategoryDeleteDialog from './CategoryDeleteDialog';

interface GroupHeaderProps {
  groupName: string;
  itemCount: number;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  isCollapsed: boolean;
  groupBy: 'category' | 'shop';
  onDeleteCategory?: (categoryName: string) => Promise<void>;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupName,
  itemCount,
  completedCount,
  totalCount,
  progressPercentage,
  isCollapsed,
  groupBy,
  onDeleteCategory,
}) => {
  return (
    <div className="flex items-center justify-between">
      <CollapsibleTrigger className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg p-1 sm:p-2 -m-1 sm:-m-2 transition-colors">
        <ChevronDown 
          className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-500 transition-transform duration-200 ${
            isCollapsed ? '-rotate-90' : ''
          }`} 
        />
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
          {groupName}
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
          {itemCount}
        </span>
        <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
          <Progress 
            value={progressPercentage} 
            className="w-16 sm:w-20 h-2"
          />
          <span className="text-xs text-gray-500 min-w-[2.5rem] sm:min-w-[3rem]">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CollapsibleTrigger>
      {groupBy === 'category' && groupName !== 'No Category' && onDeleteCategory && (
        <CategoryDeleteDialog
          categoryName={groupName}
          itemCount={itemCount}
          onConfirmDelete={onDeleteCategory}
        />
      )}
    </div>
  );
};

export default GroupHeader;
