
import React, { useState } from 'react';
import { ChevronDown, Plus, Edit, Trash2, List } from 'lucide-react';
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
          <Button variant="ghost" className="h-auto p-2 flex items-center gap-2 text-left">
            <List className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-32">{currentList.name}</span>
              <span className="text-xs text-muted-foreground">Manage Lists</span>
            </div>
            <ChevronDown className="h-3 w-3" />
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
