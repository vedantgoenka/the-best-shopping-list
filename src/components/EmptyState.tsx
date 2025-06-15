
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  onClearSearch,
}) => {
  return (
    <div className="text-center py-8 sm:py-16">
      <div className="bg-gray-50 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
        {searchTerm ? 'No matching items' : 'Your list is empty'}
      </h3>
      <p className="text-gray-500 text-sm sm:text-lg mb-4 sm:mb-6">
        {searchTerm 
          ? 'Try adjusting your search terms or clear the filter' 
          : 'Add your first item to get started with your shopping list'
        }
      </p>
      {searchTerm && (
        <Button
          variant="outline"
          onClick={onClearSearch}
          className="shadow-sm"
        >
          Clear search
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
