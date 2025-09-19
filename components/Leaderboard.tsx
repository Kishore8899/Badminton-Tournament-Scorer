import React, { useMemo, useState } from 'react';
import Card from './Card';
import { useTournament } from '../hooks/useTournament';
import { LeaderboardEntry, Category } from '../types';

const Leaderboard: React.FC = () => {
  const { leaderboardData, tournamentDetails } = useTournament();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const filteredData = useMemo(() => {
    if (selectedCategory === 'all') {
      return leaderboardData;
    }
    return leaderboardData.filter(entry => entry.category === selectedCategory);
  }, [leaderboardData, selectedCategory]);

  const sortedLeaderboard = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      if (a.pointDifference !== b.pointDifference) return b.pointDifference - a.pointDifference;
      if (a.pointsFor !== b.pointsFor) return b.pointsFor - a.pointsFor;
      return a.teamName.localeCompare(b.teamName);
    });
  }, [filteredData]);
  
  return (
    <Card title="Leaderboard">
      <div className="mb-4">
        <label htmlFor="category-filter" className="block text-sm font-medium text-brand-light/80 mb-1">
          Filter by Category
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
          className="w-full md:w-1/3 bg-brand-dark border border-brand-secondary rounded-md px-3 py-2 text-brand-light focus:ring-brand-primary focus:border-brand-primary transition"
        >
          <option value="all">All Categories</option>
          {tournamentDetails?.categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-brand-dark">
            <tr>
              <th scope="col" className="px-2 py-3 sm:px-6">Rank</th>
              <th scope="col" className="px-2 py-3 sm:px-6">Team</th>
              <th scope="col" className="px-2 py-3 sm:px-6">Category</th>
              <th scope="col" className="px-2 py-3 sm:px-6 text-center">Played</th>
              <th scope="col" className="px-2 py-3 sm:px-6 text-center">Wins</th>
              <th scope="col" className="px-2 py-3 sm:px-6 text-center">Losses</th>
              <th scope="col" className="px-2 py-3 sm:px-6 text-center">PF</th>
              <th scope="col" className="px-2 py-3 sm:px-6 text-center">PA</th>
              <th scope="col" className="px-2 py-3 sm:px-6 text-center">PD</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.length > 0 ? sortedLeaderboard.map((entry: LeaderboardEntry, index: number) => (
              <tr key={entry.teamId} className="bg-brand-secondary border-b border-brand-dark/50 hover:bg-brand-secondary/80">
                <td className="px-2 py-4 sm:px-6 font-bold text-brand-primary text-center">{index + 1}</td>
                <td className="px-2 py-4 sm:px-6 font-medium text-brand-light whitespace-nowrap">{entry.teamName}</td>
                <td className="px-2 py-4 sm:px-6 whitespace-nowrap">{entry.category}</td>
                <td className="px-2 py-4 sm:px-6 text-center">{entry.played}</td>
                <td className="px-2 py-4 sm:px-6 text-center text-green-400 font-semibold">{entry.wins}</td>
                <td className="px-2 py-4 sm:px-6 text-center text-red-400 font-semibold">{entry.losses}</td>
                <td className="px-2 py-4 sm:px-6 text-center">{entry.pointsFor}</td>
                <td className="px-2 py-4 sm:px-6 text-center">{entry.pointsAgainst}</td>
                <td className="px-2 py-4 sm:px-6 text-center font-bold">{entry.pointDifference > 0 ? `+${entry.pointDifference}` : entry.pointDifference}</td>
              </tr>
            )) : (
               <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  No match data available for the selected category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Leaderboard;