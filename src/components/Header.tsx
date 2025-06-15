
import React from 'react';
import { ShoppingBag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Shopping List</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600 truncate max-w-32 sm:max-w-none">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Sign Out</span>
              <span className="xs:hidden">Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
