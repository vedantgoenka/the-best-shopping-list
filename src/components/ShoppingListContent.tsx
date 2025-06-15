
import React from 'react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableShoppingItem from './SortableShoppingItem';
import GroupHeader from './GroupHeader';
import EmptyState from './EmptyState';
import { ShoppingItem } from '@/types/shoppingItem';

interface ShoppingListContentProps {
  filteredItems: ShoppingItem[];
  sortedItems: ShoppingItem[];
  groupedItems: Array<{
    name: string;
    items: ShoppingItem[];
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
  }>;
  searchTerm: string;
  groupBy: 'category' | 'shop';
  collapsedGroups: Set<string>;
  sensors: any;
  handleDragEnd: (event: any) => void;
  updateItem: (id: string, updates: any) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  handleDeleteCategory: (categoryName: string) => Promise<void>;
  toggleGroupCollapse: (groupName: string) => void;
  onClearSearch: () => void;
  items: ShoppingItem[];
}

const ShoppingListContent: React.FC<ShoppingListContentProps> = ({
  filteredItems,
  sortedItems,
  groupedItems,
  searchTerm,
  groupBy,
  collapsedGroups,
  sensors,
  handleDragEnd,
  updateItem,
  deleteItem,
  handleDeleteCategory,
  toggleGroupCollapse,
  onClearSearch,
  items,
}) => {
  if (filteredItems.length === 0) {
    return (
      <EmptyState
        searchTerm={searchTerm}
        onClearSearch={onClearSearch}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 sm:space-y-8">
          {groupedItems.map(group => (
            <Collapsible 
              key={group.name} 
              open={!collapsedGroups.has(group.name)}
              onOpenChange={() => toggleGroupCollapse(group.name)}
            >
              <div className="space-y-2 sm:space-y-4">
                <GroupHeader
                  groupName={group.name}
                  itemCount={group.items.length}
                  completedCount={group.completedCount}
                  totalCount={group.totalCount}
                  progressPercentage={group.progressPercentage}
                  isCollapsed={collapsedGroups.has(group.name)}
                  groupBy={groupBy}
                  onDeleteCategory={handleDeleteCategory}
                />
                <CollapsibleContent>
                  <div className="space-y-1 sm:space-y-3">
                    {group.items.map(item => (
                      <SortableShoppingItem
                        key={item.id}
                        item={item}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                        items={items}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ShoppingListContent;
