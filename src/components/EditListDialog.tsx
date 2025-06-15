
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useShoppingLists } from '@/hooks/useShoppingLists';

interface EditListDialogProps {
  list: { id: string; name: string };
  open: boolean;
  onClose: () => void;
}

const EditListDialog = ({ list, open, onClose }: EditListDialogProps) => {
  const [name, setName] = useState(list.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateList } = useShoppingLists();

  useEffect(() => {
    setName(list.name);
  }, [list.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === list.name) return;

    setIsUpdating(true);
    try {
      await updateList(list.id, name.trim());
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Shopping List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter list name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || name.trim() === list.name || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListDialog;
