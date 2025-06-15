
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useShoppingLists } from '@/hooks/useShoppingLists';

interface DeleteListDialogProps {
  listId: string;
  open: boolean;
  onClose: () => void;
}

const DeleteListDialog = ({ listId, open, onClose }: DeleteListDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteList, lists } = useShoppingLists();
  
  const listToDelete = lists.find(list => list.id === listId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteList(listId);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shopping List</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{listToDelete?.name}"? This will also delete all items in this list. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteListDialog;
