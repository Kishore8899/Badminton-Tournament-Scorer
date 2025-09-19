import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useTournament } from '../hooks/useTournament';

interface UmpireViewProps {
  matchId: string;
}

const ScoreButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`w-full h-20 text-4xl font-bold rounded-lg transition-transform transform active:scale-95 ${className}`}>
        {children}
    </button>
);

const UmpireView: React.FC<UmpireViewProps> = ({ matchId }) => {
  const { matches, updateScore, endMatch, tournamentDetails } = useTournament();
  const match = matches.find(m => m.id === matchId);
  const [isEnding, setIsEnding] = useState(false);

  if (!match) {
    return <Card title="Match Not Found">The selected match could not be found.</Card>;
  }

  const { teamA, teamB, score, status } = match;
  const pointsToWin = tournamentDetails?.scoringRules.pointsPerGame || 21;

  const handleEndMatch = async () => {
    if (score.teamA === score.teamB) {
        alert("Cannot end match with a tie score.");
        return;
    }
    setIsEnding(true);
    const winner = score.teamA > score.teamB ? teamA : teamB;
    try {
        await endMatch(matchId, winner);
    } catch(error) {
        console.error("Failed to end match", error);
        alert("Failed to end match. Please try again.");
        setIsEnding(false);
    }
  }

  const isMatchOver = score.teamA >= pointsToWin || score.teamB >= pointsToWin;

  return (
    <Card title="Live Scoring">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-brand-primary">{teamA.name} vs {teamB.name}</h3>
        <p className={`capitalize font-semibold ${
            status === 'completed' ? 'text-green-400' : 'text-yellow-400'
        }`}>{status}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 md:gap-8 items-start text-center">
        {/* Team A */}
        <div>
          <h4 className="text-xl md:text-2xl font-semibold mb-4 truncate">{teamA.name}</h4>
          <div className="text-6xl md:text-8xl font-bold text-brand-light mb-6 p-4 bg-brand-dark rounded-lg">
            {score.teamA}
          </div>
          {status !== 'completed' && (
            <div className="space-y-4">
              <ScoreButton onClick={() => updateScore(matchId, 'teamA', 1)} className="bg-green-500 text-white hover:bg-green-600">+</ScoreButton>
              <ScoreButton onClick={() => updateScore(matchId, 'teamA', -1)} className="bg-yellow-500 text-white hover:bg-yellow-600">-</ScoreButton>
            </div>
          )}
        </div>

        {/* Team B */}
        <div>
          <h4 className="text-xl md:text-2xl font-semibold mb-4 truncate">{teamB.name}</h4>
          <div className="text-6xl md:text-8xl font-bold text-brand-light mb-6 p-4 bg-brand-dark rounded-lg">
            {score.teamB}
          </div>
           {status !== 'completed' && (
            <div className="space-y-4">
              <ScoreButton onClick={() => updateScore(matchId, 'teamB', 1)} className="bg-green-500 text-white hover:bg-green-600">+</ScoreButton>
              <ScoreButton onClick={() => updateScore(matchId, 'teamB', -1)} className="bg-yellow-500 text-white hover:bg-yellow-600">-</ScoreButton>
            </div>
           )}
        </div>
      </div>
      
      {status !== 'completed' && (
        <div className="mt-10 text-center">
            {isMatchOver ? (
                <Button variant="danger" onClick={handleEndMatch} className="px-8 py-3 text-lg" disabled={isEnding}>
                    {isEnding ? 'Ending...' : 'Confirm Winner & End Match'}
                </Button>
            ) : (
                <p className="text-gray-400">First to {pointsToWin} points wins the game.</p>
            )}
        </div>
      )}
    </Card>
  );
};

export default UmpireView;
