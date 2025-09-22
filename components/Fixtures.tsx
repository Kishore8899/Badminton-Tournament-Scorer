import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useTournament } from '../hooks/useTournament';
import { Match } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { useConfirm } from '../hooks/useConfirm';

const Fixtures: React.FC = () => {
  const { matches, generateFixtures, groups } = useTournament();
  const confirm = useConfirm();
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = groups.length > 0 && groups.some(g => g.teams.length > 1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
        await generateFixtures();
    } catch (error) {
        console.error("Failed to generate fixtures", error);
        await confirm({ 
          title: 'Error', 
          message: 'Could not generate fixtures. Please try again.', 
          confirmText: 'OK', 
          cancelText: null, 
          confirmVariant: 'danger' 
        });
    } finally {
        setIsGenerating(false);
    }
  }

  return (
    <Card title="Match Fixtures">
      {matches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-subtle-text mb-4">
            {canGenerate ? 'Fixtures have not been generated yet.' : 'Please create groups with at least 2 teams to generate fixtures.'}
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating || !canGenerate}>
            <span className="flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Fixtures'}
            </span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match: Match, index: number) => (
            <div key={match.id} className="bg-gray-900 p-4 rounded-lg flex flex-wrap items-center justify-between gap-x-4 gap-y-2 transition-all hover:bg-gray-800">
              <div className="flex items-center flex-grow min-w-[250px]">
                <span className="text-primary font-bold mr-4">M{index + 1}</span>
                <div className="flex-1 text-right truncate">
                  <span className="font-semibold text-text">{match.teamA.name}</span>
                </div>
                <div className="text-center text-subtle-text font-bold mx-2 sm:mx-4">vs</div>
                <div className="flex-1 text-left truncate">
                   <span className="font-semibold text-text">{match.teamB.name}</span>
                </div>
              </div>
              <div className={`text-xs text-center font-medium w-28 capitalize px-2 py-1 rounded-full ${
                    match.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                    match.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-400'
                }`}>
                {match.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default Fixtures;