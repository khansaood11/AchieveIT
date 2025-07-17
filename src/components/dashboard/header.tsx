
'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Footprints, Lightbulb, Loader2, LogOut, Plus, Target } from 'lucide-react';
import type { FC } from 'react';
import { UserProfile } from './user-profile';

interface HeaderProps {
  onAddGoal: () => void;
  onAiSuggest: () => void;
}

export const Header: FC<HeaderProps> = ({ onAddGoal, onAiSuggest }) => {
  const { user, signOut, fitToken, connectGoogleFit, disconnectGoogleFit, isConnectingFit } = useAuth();
  
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">
          AchieveIT
        </h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {!fitToken && (
           <Button variant="outline" size="sm" onClick={connectGoogleFit} disabled={isConnectingFit}>
              <Footprints className="md:mr-2" />
              <span className="hidden md:inline">{isConnectingFit ? 'Connecting...' : 'Connect Google Fit'}</span>
            </Button>
        )}
        <Button variant="outline" size="sm" onClick={onAiSuggest}>
          <Lightbulb className="md:mr-2"/>
          <span className="hidden md:inline">AI Suggestions</span>
        </Button>
        <Button size="sm" onClick={onAddGoal}>
          <Plus className="md:mr-2"/>
          <span className="hidden md:inline">Add New Goal</span>
        </Button>
        {user && <UserProfile user={user} fitToken={fitToken} onSignOut={signOut} onConnectFit={connectGoogleFit} onDisconnectFit={disconnectGoogleFit} />}
      </div>
    </header>
  );
};
