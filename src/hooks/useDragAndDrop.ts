
import { useState } from 'react';
import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  sortableKeyboardCoordinates,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ShoppingItem } from '@/types/shoppingItem';

interface UseDragAndDropProps {
  sortedItems: ShoppingItem[];
  reorderItems: (items: ShoppingItem[]) => Promise<void>;
}

export const useDragAndDrop = ({ sortedItems, reorderItems }: UseDragAndDropProps) => {
  const [isManuallyReordering, setIsManuallyReordering] = useState(false);

  // Drag and drop sensors with better configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag end:', { active: active.id, over: over?.id });

    if (over && active.id !== over.id) {
      // Set manual reordering flag to prevent automatic sorting
      setIsManuallyReordering(true);
      
      // Find the global indices in the sortedItems array
      const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
      const newIndex = sortedItems.findIndex((item) => item.id === over.id);
      
      console.log('Reordering:', { oldIndex, newIndex });

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(sortedItems, oldIndex, newIndex);
        await reorderItems(reorderedItems);
        
        // Don't reset the flag automatically - let it stay until user changes sort
        console.log('Reorder completed, keeping manual mode active');
      }
    }
  };

  const resetManualReordering = () => {
    setIsManuallyReordering(false);
  };

  return {
    sensors,
    isManuallyReordering,
    handleDragEnd,
    resetManualReordering,
  };
};
