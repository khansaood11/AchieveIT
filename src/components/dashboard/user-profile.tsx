
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle, Footprints, LogOut, XCircle } from 'lucide-react';
import type { User } from 'firebase/auth';

interface UserProfileProps {
  user: User;
  fitToken: string | null;
  onSignOut: () => void;
  onConnectFit: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, fitToken, onSignOut, onConnectFit }) => {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={!fitToken ? onConnectFit : undefined}>
          <Footprints className="mr-2" />
          <span>Google Fit</span>
          {fitToken ? (
            <span className="ml-auto text-xs flex items-center text-green-600">
              <CheckCircle className="mr-1 h-4 w-4" /> Connected
            </span>
          ) : (
            <span className="ml-auto text-xs flex items-center text-red-600">
              <XCircle className="mr-1 h-4 w-4" /> Not Connected
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
          <LogOut className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
