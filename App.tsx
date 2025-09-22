import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import TournamentWizard from './components/TournamentWizard';
import PlayerRegistration from './components/PlayerRegistration';
import TeamManagement from './components/TeamManagement';
import GroupDivision from './components/GroupDivision';
import Fixtures from './components/Fixtures';
import UmpireView, { MatchSelector } from './components/UmpireView';
import Leaderboard from './components/Leaderboard';
import { useTournament } from './hooks/useTournament';
import { ShuttlecockIcon } from './components/icons/ShuttlecockIcon';
import ExportData from './components/ExportData';

type Tab = 'Setup' | 'Players' | 'Teams' | 'Groups' | 'Fixtures' | 'Export' | 'Live Match' | 'Leaderboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Setup');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { tournamentDetails, matches, isLoading } = useTournament();

  const TABS: Tab[] = ['Setup', 'Players', 'Teams', 'Groups', 'Fixtures', 'Live Match', 'Leaderboard', 'Export'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
        <ShuttlecockIcon className="w-20 h-20 text-primary animate-bounce" />
        <h1 className="text-2xl font-bold mt-4">Loading Tournament...</h1>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Setup':
        return <TournamentWizard />;
      case 'Players':
        return <PlayerRegistration />;
      case 'Teams':
        return <TeamManagement />;
      case 'Groups':
        return <GroupDivision />;
      case 'Fixtures':
        return <Fixtures />;
      case 'Export':
        return <ExportData />;
      case 'Live Match':
        if (selectedMatchId) {
          return <UmpireView matchId={selectedMatchId} onBack={() => setSelectedMatchId(null)} />;
        }
        return matches.length > 0 ?
          <MatchSelector onSelectMatch={setSelectedMatchId} /> :
          <NoMatchesPlaceholder />;
      case 'Leaderboard':
        return <Leaderboard />;
      default:
        return <TournamentWizard />;
    }
  };
  
  const NoMatchesPlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 bg-secondary rounded-lg h-96">
        <ShuttlecockIcon className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Matches Available</h2>
        <p className="text-subtle-text">
            Generate fixtures in the 'Fixtures' tab to start a match.
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header title={tournamentDetails?.name || "Badminton Manager"} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Tabs<Tab>
          tabs={TABS}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
        <div className="mt-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;