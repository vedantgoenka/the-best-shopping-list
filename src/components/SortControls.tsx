import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortControlsProps {
  sortBy: 'manual' | 'name' | 'category' | 'shop' | 'created' | 'completed';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'manual' | 'name' | 'category' | 'shop' | 'created' | 'completed') => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10"
          title="Sort options"
        >
          <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onSortChange('manual')}>
          Manual Order {sortBy === 'manual' && (sortOrder === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('name')}>
          Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('category')}>
          Sort by Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('shop')}>
          Sort by Shop {sortBy === 'shop' && (sortOrder === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('created')}>
          Sort by Date Added {sortBy === 'created' && (sortOrder === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('completed')}>
          Sort by Status {sortBy === 'completed' && (sortOrder === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortControls;
