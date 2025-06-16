import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import DeleteListDialog from './DeleteListDialog';

interface ManageListsModalProps {
  open: boolean;
  onClose: () => void;
}

const ManageListsModal: React.FC<ManageListsModalProps> = ({ open, onClose }) => {
  const { lists, currentList, switchToList, createList, updateList } = useShoppingLists();
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleStartEdit = (list: { id: string; name: string }) => {
    setEditingListId(list.id);
    setEditingName(list.name);
  };

  const handleSaveEdit = async () => {
    if (editingListId && editingName.trim()) {
      await updateList(editingListId, editingName.trim());
      setEditingListId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditingName('');
  };

  const handleCreateNew = async () => {
    if (newListName.trim()) {
      await createList(newListName.trim());
      setNewListName('');
      setIsCreating(false);
    }
  };



  const handleCancelCreate = () => {
    setNewListName('');
    setIsCreating(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg w-full mx-4">
          <DialogHeader>
            <DialogTitle>
              Manage Lists
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Existing Lists */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lists.map((list) => (
                <div key={list.id} className="flex items-center gap-2 p-2 rounded-lg border">
                  {editingListId === list.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button variant="ghost" size="sm" onClick={handleSaveEdit}>
                        ✓
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        ✗
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center gap-2">
                        <span 
                          className={`cursor-pointer ${currentList?.id === list.id ? 'font-medium text-blue-600' : ''}`}
                          onClick={() => switchToList(list)}
                        >
                          {list.name}
                        </span>
                        {currentList?.id === list.id && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(list)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {lists.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingListId(list.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Create New List */}
            <div className="border-t pt-4 mt-4">
              {isCreating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter list name"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateNew();
                        if (e.key === 'Escape') handleCancelCreate();
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleCreateNew}
                      disabled={!newListName.trim()}
                    >
                      Create
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelCreate}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New List
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

export default ManageListsModal; 