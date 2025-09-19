
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

type Tab = 'Setup' | 'Players' | 'Teams' | 'Groups' | 'Fixtures' | 'Live Match' | 'Leaderboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Setup');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { tournamentDetails, matches, isLoading } = useTournament();

  const TABS: Tab[] = ['Setup', 'Players', 'Teams', 'Groups', 'Fixtures', 'Live Match', 'Leaderboard'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-center p-4">
        <ShuttlecockIcon className="w-20 h-20 text-brand-primary animate-bounce" />
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
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 bg-brand-secondary rounded-lg h-96">
        <ShuttlecockIcon className="w-16 h-16 text-brand-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Matches Available</h2>
        <p className="text-brand-light/70">
            Generate fixtures in the 'Fixtures' tab to start a match.
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
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
