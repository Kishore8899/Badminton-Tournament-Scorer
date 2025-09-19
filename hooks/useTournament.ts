import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Tournament, Player, Team, Group, Match, LeaderboardEntry, Category } from '../types';
import { api } from '../api';

interface TournamentContextType {
  isLoading: boolean;
  tournamentDetails: Tournament | null;
  players: Player[];
  teams: Team[];
  groups: Group[];
  matches: Match[];
  leaderboardData: LeaderboardEntry[];
  setTournamentDetails: (details: Tournament) => Promise<void>;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  removeTeam: (teamId: string) => Promise<void>;
  createGroup: (name: string) => Promise<void>;
  assignTeamToGroup: (team: Team, groupId: string) => Promise<void>;
  autoAssignGroups: (numGroups: number) => Promise<void>;
  generateFixtures: () => Promise<void>;
  setScore: (matchId: string, teamKey: 'teamA' | 'teamB', score: number) => Promise<void>;
  endMatch: (matchId: string, winner: Team) => Promise<void>;
  reopenMatch: (matchId: string) => Promise<void>;
  resetTournament: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentDetails, setTournamentDetailsState] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await api.fetchTournamentData();
        setTournamentDetailsState(data.tournamentDetails);
        setPlayers(data.players);
        setTeams(data.teams);
        setGroups(data.groups);
        setMatches(data.matches);
      } catch (error) {
        console.error("Failed to load tournament data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const setTournamentDetails = useCallback(async (details: Tournament) => {
    const updatedDetails = await api.updateTournamentDetails(details);
    setTournamentDetailsState(updatedDetails);
  }, []);

  const addPlayer = useCallback(async (player: Omit<Player, 'id'>) => {
    const updatedPlayers = await api.createPlayer(player);
    setPlayers(updatedPlayers);
  }, []);

  const removePlayer = useCallback(async (playerId: string) => {
    const updatedData = await api.deletePlayer(playerId);
    setPlayers(updatedData.players);
    setTeams(updatedData.teams);
    setGroups(updatedData.groups);
    setMatches(updatedData.matches);
  }, []);

  const addTeam = useCallback(async (team: Omit<Team, 'id'>) => {
    const updatedTeams = await api.createTeam(team);
    setTeams(updatedTeams);
  }, []);

  const removeTeam = useCallback(async (teamId: string) => {
    const updatedData = await api.deleteTeam(teamId);
    setTeams(updatedData.teams);
    setGroups(updatedData.groups);
    setMatches(updatedData.matches);
  }, []);

  const createGroup = useCallback(async (name: string) => {
    const newGroups = [...groups, { id: `g${Date.now()}`, name, teams: [] }];
    const updatedGroups = await api.updateGroups(newGroups);
    setGroups(updatedGroups);
  }, [groups]);

  const assignTeamToGroup = useCallback(async (team: Team, groupId: string) => {
    const newGroups = groups.map(group => {
      const filteredTeams = group.teams.filter(t => t.id !== team.id);
      if (group.id === groupId) {
        return { ...group, teams: [...filteredTeams, team] };
      }
      return { ...group, teams: filteredTeams };
    });
    const updatedGroups = await api.updateGroups(newGroups);
    setGroups(updatedGroups);
  }, [groups]);

  const autoAssignGroups = useCallback(async (numGroups: number) => {
    const newGroups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
      id: `g${i + 1}`,
      name: `Group ${String.fromCharCode(65 + i)}`,
      teams: [],
    }));
    teams.forEach((team, index) => {
      const groupIndex = index % numGroups;
      newGroups[groupIndex].teams.push(team);
    });
    const updatedGroups = await api.updateGroups(newGroups);
    setGroups(updatedGroups);
  }, [teams]);

  const generateFixtures = useCallback(async () => {
    const newMatches = await api.generateFixtures();
    setMatches(newMatches);
  }, []);

  const setScore = useCallback(async (matchId: string, teamKey: 'teamA' | 'teamB', score: number) => {
    const updatedMatches = await api.setMatchScore(matchId, teamKey, score);
    setMatches(updatedMatches);
  }, []);

  const endMatch = useCallback(async (matchId: string, winner: Team) => {
    const updatedMatches = await api.completeMatch(matchId, winner);
    setMatches(updatedMatches);
  }, []);

  const reopenMatch = useCallback(async (matchId: string) => {
    const updatedMatches = await api.reopenMatch(matchId);
    setMatches(updatedMatches);
  }, []);

  const resetTournament = useCallback(() => {
    api.resetTournamentData();
    window.location.reload();
  }, []);

  const teamToGroupMap = useMemo(() => {
    const map = new Map<string, { id: string, name: string }>();
    groups.forEach(group => {
        group.teams.forEach(team => {
            map.set(team.id, { id: group.id, name: group.name });
        });
    });
    return map;
  }, [groups]);

  const leaderboardData = useMemo<LeaderboardEntry[]>(() => {
    const stats: { [key: string]: LeaderboardEntry } = {};
    teams.forEach(team => {
      const groupInfo = teamToGroupMap.get(team.id);
      stats[team.id] = { 
        teamId: team.id, 
        teamName: team.name, 
        category: team.category,
        groupId: groupInfo?.id,
        groupName: groupInfo?.name,
        played: 0, 
        wins: 0, 
        losses: 0, 
        pointsFor: 0, 
        pointsAgainst: 0, 
        pointDifference: 0, 
        gamesWon: 0 
      };
    });
    matches.filter(m => m.status === 'completed').forEach(match => {
      const teamAStats = stats[match.teamA.id];
      const teamBStats = stats[match.teamB.id];
      if (!teamAStats || !teamBStats) return;
      teamAStats.played++;
      teamBStats.played++;
      teamAStats.pointsFor += match.score.teamA;
      teamAStats.pointsAgainst += match.score.teamB;
      teamBStats.pointsFor += match.score.teamB;
      teamBStats.pointsAgainst += match.score.teamA;
      if (match.winner?.id === match.teamA.id) {
        teamAStats.wins++;
        teamBStats.losses++;
      } else if (match.winner?.id === match.teamB.id) {
        teamBStats.wins++;
        teamAStats.losses++;
      }
    });
    return Object.values(stats).map(s => ({ ...s, pointDifference: s.pointsFor - s.pointsAgainst }));
  }, [matches, teams, teamToGroupMap]);
  
  const value: TournamentContextType = {
    isLoading, tournamentDetails, players, teams, groups, matches, leaderboardData,
    setTournamentDetails, addPlayer, removePlayer, addTeam, removeTeam, createGroup,
    assignTeamToGroup, autoAssignGroups, generateFixtures, setScore, endMatch,
    reopenMatch, resetTournament,
  };

  return React.createElement(TournamentContext.Provider, { value }, children);
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};