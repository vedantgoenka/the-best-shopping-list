
import React, { useState } from 'react';
import { ChevronDown, Plus, Edit, Trash2, ShoppingBag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import CreateListDialog from './CreateListDialog';
import EditListDialog from './EditListDialog';
import DeleteListDialog from './DeleteListDialog';

const ShoppingListDropdown = () => {
  const { lists, currentList, switchToList } = useShoppingLists();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingList, setEditingList] = useState<{ id: string; name: string } | null>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  if (!currentList) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto min-h-[3rem] p-3 flex items-center gap-3 text-left">
            <ShoppingBag className="text-blue-600 flex-shrink-0" style={{ width: '2rem', height: '2rem' }} />
            <span className="text-xl font-bold text-gray-800">{currentList.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Shopping Lists</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {lists.map((list) => (
            <DropdownMenuItem
              key={list.id}
              className="flex items-center justify-between group"
              onClick={() => switchToList(list)}
            >
              <span className={`flex-1 truncate ${currentList.id === list.id ? 'font-medium' : ''}`}>
                {list.name}
              </span>
              {currentList.id === list.id && (
                <span className="text-xs text-blue-600">Current</span>
              )}
              {lists.length > 1 && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingList({ id: list.id, name: list.name });
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingListId(list.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateListDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
      
      {editingList && (
        <EditListDialog
          list={editingList}
          open={!!editingList}
          onClose={() => setEditingList(null)}
        />
      )}
      
      {deletingListId && (
        <DeleteListDialog
          listId={deletingListId}
          open={!!deletingListId}
          onClose={() => setDeletingListId(null)}
        />
      )}
    </>
  );
};

export default ShoppingListDropdown;
