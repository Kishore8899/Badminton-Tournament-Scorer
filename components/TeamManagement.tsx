import React, { useState, useMemo } from 'react';
import Card from './Card';
import Button from './Button';
import { useTournament } from '../hooks/useTournament';
import { Category, Player, Team } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { TrashIcon } from './icons/TrashIcon';

const TeamManagement: React.FC = () => {
  const { players, teams, addTeam, removeTeam, tournamentDetails } = useTournament();
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>(tournamentDetails?.categories[0] || '');
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDoubles = useMemo(() => {
    if (!selectedCategory) return false;
    return selectedCategory.includes('Doubles');
  }, [selectedCategory]);

  const teamedPlayerIds = useMemo(() => {
    return new Set(teams.flatMap(team => team.players.map(p => p.id)));
  }, [teams]);

  const player1Options = useMemo(() => {
    // A player is available for P1 if they are not on a team OR they are the currently selected P1.
    return players.filter(p => !teamedPlayerIds.has(p.id) || p.id === player1Id);
  }, [players, teamedPlayerIds, player1Id]);

  const player2Options = useMemo(() => {
    // A player is available for P2 if they meet P1's criteria AND are not the currently selected P1.
    return players.filter(p => (!teamedPlayerIds.has(p.id) || p.id === player2Id) && p.id !== player1Id);
  }, [players, teamedPlayerIds, player1Id, player2Id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !player1Id || (isDoubles && !player2Id)) return;

    setIsSubmitting(true);
    const player1 = players.find(p => p.id === player1Id);
    if (!player1) {
      setIsSubmitting(false);
      return;
    }

    let newTeam: Omit<Team, 'id'>;

    if (isDoubles) {
      const player2 = players.find(p => p.id === player2Id);
      if (!player2) {
        setIsSubmitting(false);
        return;
      }
      newTeam = { name: `${player1.name} / ${player2.name}`, category: selectedCategory, players: [player1, player2] };
    } else {
      newTeam = { name: player1.name, category: selectedCategory, players: [player1] };
    }

    try {
      await addTeam(newTeam);
      setPlayer1Id('');
      setPlayer2Id('');
    } catch (error) {
      console.error("Failed to add team", error);
      alert('Could not add team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemove = async (teamId: string) => {
    try {
        await removeTeam(teamId);
    } catch (error) {
        console.error("Failed to remove team", error);
        alert('Could not remove team. Please try again.');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Create New Team">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-light/80 mb-1">Category</label>
              <select 
                value={selectedCategory} 
                onChange={e => { setSelectedCategory(e.target.value as Category); setPlayer1Id(''); setPlayer2Id(''); }}
                className="w-full bg-brand-dark border border-brand-secondary rounded-md px-3 py-2 text-brand-light focus:ring-brand-primary focus:border-brand-primary transition"
                required
              >
                <option value="">Select a category</option>
                {tournamentDetails?.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            {selectedCategory && (
              <>
                <div>
                  <label className="block text-sm font-medium text-brand-light/80 mb-1">{isDoubles ? 'Player 1' : 'Player'}</label>
                  <select value={player1Id} onChange={e => setPlayer1Id(e.target.value)} className="w-full bg-brand-dark border border-brand-secondary rounded-md px-3 py-2 text-brand-light focus:ring-brand-primary focus:border-brand-primary transition" required>
                    <option value="">Select player...</option>
                    {player1Options.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {isDoubles && (
                  <div>
                    <label className="block text-sm font-medium text-brand-light/80 mb-1">Player 2</label>
                    <select value={player2Id} onChange={e => setPlayer2Id(e.target.value)} className="w-full bg-brand-dark border border-brand-secondary rounded-md px-3 py-2 text-brand-light focus:ring-brand-primary focus:border-brand-primary transition" required>
                      <option value="">Select player...</option>
                      {player2Options.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || !selectedCategory || !player1Id || (isDoubles && !player2Id)}>
              <span className="flex items-center justify-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Creating Team...' : 'Create Team'}
              </span>
            </Button>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card title={`Created Teams (${teams.length})`}>
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[400px] text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-brand-dark sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-6">Team Name</th>
                  <th scope="col" className="px-4 py-3 sm:px-6">Category</th>
                  <th scope="col" className="px-4 py-3 sm:px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {teams.length > 0 ? teams.map(team => (
                  <tr key={team.id} className="bg-brand-secondary border-b border-brand-dark/50 hover:bg-brand-secondary/80">
                    <td className="px-4 py-4 sm:px-6 font-medium text-brand-light whitespace-nowrap">{team.name}</td>
                    <td className="px-4 py-4 sm:px-6">{team.category}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <Button variant="danger" onClick={() => handleRemove(team.id)} className="px-2 py-1">
                         <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">No teams created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamManagement;