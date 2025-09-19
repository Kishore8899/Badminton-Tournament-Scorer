import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useTournament } from '../hooks/useTournament';
import { Team } from '../types';

const GroupDivision: React.FC = () => {
  const { teams, groups, assignTeamToGroup, createGroup, autoAssignGroups } = useTournament();
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const ungroupedTeams = teams.filter(team => 
    !groups.some(group => group.teams.some(t => t.id === team.id))
  );

  const handleAssign = (teamId: string, groupId: string) => {
    const team = ungroupedTeams.find(t => t.id === teamId);
    if(team) {
      assignTeamToGroup(team, groupId);
    }
  };

  const handleAutoAssign = async (numGroups: number) => {
    setIsAutoAssigning(true);
    await autoAssignGroups(numGroups);
    setIsAutoAssigning(false);
  }

  const handleCreateGroup = async () => {
    setIsAddingGroup(true);
    await createGroup(`Group ${String.fromCharCode(65 + groups.length)}`);
    setIsAddingGroup(false);
  }
  
  return (
    <div className="space-y-6">
      <Card title="Ungrouped Teams">
        <div className="flex flex-wrap gap-2">
          {ungroupedTeams.length > 0 ? ungroupedTeams.map(team => (
            <div key={team.id} className="bg-brand-dark px-3 py-1 rounded-full text-sm font-medium text-brand-light">
              {team.name}
            </div>
          )) : <p className="text-gray-400">All teams have been assigned to a group.</p>}
        </div>
      </Card>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold">Groups</h2>
        <div className="flex gap-2">
            <Button onClick={() => handleAutoAssign(2)} disabled={isAutoAssigning || ungroupedTeams.length === 0}>
                {isAutoAssigning ? 'Assigning...' : 'Auto-Assign All'}
            </Button>
            <Button onClick={handleCreateGroup} variant="secondary" disabled={isAddingGroup}>
                {isAddingGroup ? 'Adding...' : 'Add Group'}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <Card key={group.id} title={group.name}>
            <div className="space-y-3 min-h-[100px]">
              {group.teams.map(team => (
                <div key={team.id} className="flex justify-between items-center bg-brand-dark p-2 rounded-md">
                  <span className="text-brand-light font-semibold">{team.name}</span>
                  <span className="text-xs text-gray-400">{team.category}</span>
                </div>
              ))}
               {group.teams.length === 0 && <p className="text-center text-gray-500 pt-4">This group is empty.</p>}
              {ungroupedTeams.length > 0 && (
                <div className="pt-2">
                  <select 
                    value=""
                    onChange={e => handleAssign(e.target.value, group.id)}
                    className="w-full bg-brand-dark border border-brand-secondary rounded-md px-3 py-2 text-brand-light focus:ring-brand-primary focus:border-brand-primary transition"
                  >
                    <option value="" disabled>Assign a team...</option>
                    {ungroupedTeams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupDivision;
