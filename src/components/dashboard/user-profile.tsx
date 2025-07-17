
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
import { CheckCircle, Footprints, Link2Off, LogOut, XCircle } from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import * as React from 'react';

interface UserProfileProps {
  user: User;
  fitToken: string | null;
  onSignOut: () => void;
  onConnectFit: () => void;
  onDisconnectFit: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, fitToken, onSignOut, onConnectFit, onDisconnectFit }) => {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  const handleDisconnectClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dropdown from closing
    onDisconnectFit();
  }

  return (
    <AlertDialog>
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
            <DropdownMenuItem className="cursor-pointer" onClick={!fitToken ? onConnectFit : undefined} disabled={!!fitToken}>
              <Footprints className="mr-2" />
              <span>Google Fit</span>
              {fitToken ? (
                <span className="ml-auto text-xs flex items-center text-green-600">
                  <CheckCircle className="mr-1 h-4 w-4" /> Connected
                </span>
              ) : (
                <span className="ml-auto text-xs flex items-center text-muted-foreground">
                  <XCircle className="mr-1 h-4 w-4" /> Not Connected
                </span>
              )}
            </DropdownMenuItem>
            {fitToken && (
               <AlertDialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                  <Link2Off className="mr-2" />
                  <span>Disconnect Google Fit</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer focus:text-destructive">
            <LogOut className="mr-2" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will disconnect your Google Fit account from AchieveIT. You will no longer see your health data on the dashboard. You can reconnect at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDisconnectClick} className="bg-destructive hover:bg-destructive/90">
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

    </AlertDialog>
  );
};
