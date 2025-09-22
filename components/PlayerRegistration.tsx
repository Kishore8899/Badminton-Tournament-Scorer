import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import { useTournament } from '../hooks/useTournament';
import { Player, DominantHand } from '../types';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { TrashIcon } from './icons/TrashIcon';

const PlayerRegistration: React.FC = () => {
  const { players, addPlayer, removePlayer } = useTournament();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dominantHand, setDominantHand] = useState<DominantHand | ''>('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      setIsSubmitting(true);
      const newPlayer: Omit<Player, 'id'> = {
        name,
        ...(dominantHand && { dominantHand }),
        ...(age && { age: parseInt(age, 10) }),
        ...(contact && { contact }),
      };
      try {
        await addPlayer(newPlayer);
        setName('');
        setAge('');
        setDominantHand('');
        setContact('');
      } catch (error) {
        console.error("Failed to add player", error);
        alert('Could not add player. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRemove = async (playerId: string) => {
    if (window.confirm('Are you sure you want to remove this player? This will also remove any team they are on and any associated matches.')) {
        try {
            await removePlayer(playerId);
        } catch (error) {
            console.error("Failed to remove player", error);
            alert('Could not remove player. Please try again.');
        }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Register New Player">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" id="playerName" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Age (Optional)" id="playerAge" type="number" value={age} onChange={e => setAge(e.target.value)} />
            <Input label="Contact (Optional)" id="playerContact" value={contact} onChange={e => setContact(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-subtle-text mb-1">Dominant Hand (Optional)</label>
              <select 
                value={dominantHand} 
                onChange={e => setDominantHand(e.target.value as DominantHand)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-text focus:ring-1 focus:ring-primary focus:border-primary transition"
              >
                <option value="">Select Hand</option>
                <option value={DominantHand.Right}>Right</option>
                <option value={DominantHand.Left}>Left</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !name}>
              {isSubmitting ? 'Adding Player...' : (
                <span className="flex items-center justify-center">
                  <UserPlusIcon className="w-5 h-5 mr-2" /> Add Player
                </span>
              )}
            </Button>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card title={`Registered Players (${players.length})`}>
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[400px] text-sm text-left text-subtle-text">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900 sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-6">Name</th>
                  <th scope="col" className="px-4 py-3 sm:px-6">Age</th>
                  <th scope="col" className="px-4 py-3 sm:px-6">Hand</th>
                  <th scope="col" className="px-4 py-3 sm:px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {players.length > 0 ? players.map(player => (
                  <tr key={player.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-4 sm:px-6 font-medium text-text whitespace-nowrap">{player.name}</td>
                    <td className="px-4 py-4 sm:px-6">{player.age ?? 'N/A'}</td>
                    <td className="px-4 py-4 sm:px-6">{player.dominantHand ?? 'N/A'}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <Button variant="danger" onClick={() => handleRemove(player.id)} className="px-2 py-1">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-subtle-text">No players registered yet.</td>
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

export default PlayerRegistration;