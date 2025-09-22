import React, { useState, useMemo } from 'react';
import Card from './Card';
import Button from './Button';
import { useTournament } from '../hooks/useTournament';
import { Group, Match } from '../types';
import { useConfirm } from '../hooks/useConfirm';

// --- New Component for Selecting a Match ---

interface MatchSelectorProps {
  onSelectMatch: (matchId: string) => void;
}

export const MatchSelector: React.FC<MatchSelectorProps> = ({ onSelectMatch }) => {
  const { matches, groups } = useTournament();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  const teamToGroupMap = useMemo(() => {
    const map = new Map<string, Group>();
    groups.forEach(group => {
      group.teams.forEach(team => {
        map.set(team.id, group);
      });
    });
    return map;
  }, [groups]);

  const filteredMatches = useMemo(() => {
    if (selectedGroupId === 'all') {
      return matches;
    }
    return matches.filter(match => {
      const groupA = teamToGroupMap.get(match.teamA.id);
      return groupA?.id === selectedGroupId;
    });
  }, [matches, selectedGroupId, teamToGroupMap]);

  return (
    <Card title="Select a Match to Score">
      <div className="mb-4">
        <label htmlFor="group-filter" className="block text-sm font-medium text-subtle-text mb-1">
          Filter by Group
        </label>
        <select
          id="group-filter"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="w-full md:w-1/3 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-text focus:ring-1 focus:ring-primary focus:border-primary transition"
        >
          <option value="all">All Groups</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4 max-h-[60vh] overflow-auto">
        {filteredMatches.map((match: Match) => (
          <div key={match.id} className="bg-gray-900 p-4 rounded-lg flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center flex-grow min-w-[250px]">
              <div className="flex-1 text-right truncate">
                <span className="font-semibold text-text">{match.teamA.name}</span>
              </div>
              <div className="text-center text-subtle-text font-bold mx-2 sm:mx-4">vs</div>
              <div className="flex-1 text-left truncate">
                 <span className="font-semibold text-text">{match.teamB.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <div className={`text-xs text-center font-medium w-28 capitalize px-2 py-1 rounded-full ${
                      match.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      match.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-400'
                  }`}>
                  {match.status}
                </div>
                <Button onClick={() => onSelectMatch(match.id)}>
                  {match.status === 'completed' ? 'View/Edit' : 'Score Match'}
                </Button>
            </div>
          </div>
        ))}
        {filteredMatches.length === 0 && (
            <p className="text-center py-8 text-subtle-text">No matches found for the selected group.</p>
        )}
      </div>
    </Card>
  );
};


// --- Umpire Scoring View ---

interface UmpireViewProps {
  matchId: string;
  onBack: () => void;
}

const ScoreButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`w-full h-20 text-4xl font-bold rounded-lg transition-transform transform active:scale-95 ${className}`}>
        {children}
    </button>
);

const UmpireView: React.FC<UmpireViewProps> = ({ matchId, onBack }) => {
  const { matches, setScore, endMatch, reopenMatch, tournamentDetails } = useTournament();
  const confirm = useConfirm();
  const match = matches.find(m => m.id === matchId);
  const [isEnding, setIsEnding] = useState(false);

  if (!match) {
    return <Card title="Match Not Found">The selected match could not be found.</Card>;
  }

  const { teamA, teamB, score, status, winner } = match;
  const pointsToWin = tournamentDetails?.scoringRules.pointsPerGame || 21;

  const handleEndMatch = async () => {
    if (score.teamA === score.teamB) {
        await confirm({
          title: 'Cannot End Match',
          message: 'A match cannot be ended with a tie score.',
          confirmText: 'OK',
          cancelText: null,
          confirmVariant: 'secondary'
        });
        return;
    }
    setIsEnding(true);
    const newWinner = score.teamA > score.teamB ? teamA : teamB;
    try {
        await endMatch(matchId, newWinner);
    } catch(error) {
        console.error("Failed to end match", error);
        await confirm({ 
          title: 'Error', 
          message: 'Failed to end match. Please try again.', 
          confirmText: 'OK', 
          cancelText: null, 
          confirmVariant: 'danger' 
        });
    } finally {
        setIsEnding(false);
    }
  };
  
  const handleScoreChange = (teamKey: 'teamA' | 'teamB', value: string) => {
    const newScore = parseInt(value, 10);
    if (!isNaN(newScore)) {
        setScore(matchId, teamKey, newScore);
    } else if (value === '') {
        setScore(matchId, teamKey, 0);
    }
  };

  const isMatchOver = score.teamA >= pointsToWin || score.teamB >= pointsToWin;
  const isCompleted = status === 'completed';

  return (
    <Card title={isCompleted ? "Match Result" : "Live Scoring"}>
      <div className="flex justify-end mb-4 -mt-2">
        <Button variant="secondary" onClick={onBack}>
          &larr; Back to All Matches
        </Button>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-primary">{teamA.name} vs {teamB.name}</h3>
        {isCompleted && winner ? (
             <p className="text-lg font-bold text-green-400 mt-2">{winner.name} won the match!</p>
        ) : (
            <p className={`capitalize font-semibold text-yellow-400`}>{status}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 md:gap-8 items-start text-center">
        {/* Team A */}
        <div>
          <h4 className="text-xl md:text-2xl font-semibold mb-4 truncate">{teamA.name}</h4>
          {isCompleted ? (
            <div className="text-6xl md:text-8xl font-bold text-text p-4">{score.teamA}</div>
          ) : (
            <input 
              type="number"
              value={score.teamA}
              onChange={e => handleScoreChange('teamA', e.target.value)}
              className="w-full text-6xl md:text-8xl font-bold text-text mb-6 p-4 bg-gray-900 rounded-lg text-center"
            />
          )}
          {!isCompleted && (
            <div className="space-y-4">
              <ScoreButton onClick={() => setScore(matchId, 'teamA', score.teamA + 1)} className="bg-green-500 text-white hover:bg-green-600">+</ScoreButton>
              <ScoreButton onClick={() => setScore(matchId, 'teamA', score.teamA - 1)} className="bg-yellow-500 text-white hover:bg-yellow-600">-</ScoreButton>
            </div>
          )}
        </div>

        {/* Team B */}
        <div>
          <h4 className="text-xl md:text-2xl font-semibold mb-4 truncate">{teamB.name}</h4>
           {isCompleted ? (
            <div className="text-6xl md:text-8xl font-bold text-text p-4">{score.teamB}</div>
          ) : (
            <input 
              type="number"
              value={score.teamB}
              onChange={e => handleScoreChange('teamB', e.target.value)}
              className="w-full text-6xl md:text-8xl font-bold text-text mb-6 p-4 bg-gray-900 rounded-lg text-center"
            />
          )}
           {!isCompleted && (
            <div className="space-y-4">
              <ScoreButton onClick={() => setScore(matchId, 'teamB', score.teamB + 1)} className="bg-green-500 text-white hover:bg-green-600">+</ScoreButton>
              <ScoreButton onClick={() => setScore(matchId, 'teamB', score.teamB - 1)} className="bg-yellow-500 text-white hover:bg-yellow-600">-</ScoreButton>
            </div>
           )}
        </div>
      </div>
      
      <div className="mt-10 text-center">
          {isCompleted ? (
               <Button variant="secondary" onClick={() => reopenMatch(matchId)} className="px-8 py-3 text-lg">
                  Edit Match
              </Button>
          ) : isMatchOver ? (
              <Button variant="danger" onClick={handleEndMatch} className="px-8 py-3 text-lg" disabled={isEnding}>
                  {isEnding ? 'Ending...' : 'Confirm Winner & End Match'}
              </Button>
          ) : (
              <p className="text-subtle-text">First to {pointsToWin} points wins the game.</p>
          )}
      </div>
    </Card>
  );
};

export default UmpireView;