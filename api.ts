import { Tournament, Player, Team, Group, Match, Category } from './types';

const STORAGE_KEY = 'badmintonTournamentData';

// Simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AppData {
  tournamentDetails: Tournament | null;
  players: Player[];
  teams: Team[];
  groups: Group[];
  matches: Match[];
}

const initialTournament: Tournament = {
  id: 't1',
  name: "Ki Badminton Tournament Scorer",
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  categories: [Category.MensSingles, Category.MensDoubles, Category.MixedDoubles],
  scoringRules: { pointsPerGame: 21 }
};

const getInitialData = (): AppData => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to parse data from localStorage", error);
    localStorage.removeItem(STORAGE_KEY);
  }
  
  // Return default state if nothing is stored or parsing fails
  return {
    tournamentDetails: initialTournament,
    players: [],
    teams: [],
    groups: [],
    matches: [],
  };
};

const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage", error);
  }
};

// --- API Functions ---

export const api = {
  async fetchTournamentData(): Promise<AppData> {
    await sleep(500);
    return getInitialData();
  },

  async updateTournamentDetails(details: Tournament): Promise<Tournament> {
    await sleep(300);
    const data = getInitialData();
    data.tournamentDetails = details;
    saveData(data);
    return details;
  },
  
  async createPlayer(player: Omit<Player, 'id'>): Promise<Player[]> {
    await sleep(300);
    const data = getInitialData();
    const newPlayer = { ...player, id: `p${Date.now()}` };
    data.players.push(newPlayer);
    saveData(data);
    return data.players;
  },
  
  async deletePlayer(playerId: string): Promise<AppData> {
    await sleep(300);
    const data = getInitialData();
    const teamIdsPlayerWasOn = new Set(data.teams.filter(t => t.players.some(p => p.id === playerId)).map(t => t.id));
    
    data.players = data.players.filter(p => p.id !== playerId);
    data.teams = data.teams.filter(t => !teamIdsPlayerWasOn.has(t.id));
    data.groups = data.groups.map(g => ({ ...g, teams: g.teams.filter(t => !teamIdsPlayerWasOn.has(t.id)) }));
    data.matches = data.matches.filter(m => !teamIdsPlayerWasOn.has(m.teamA.id) && !teamIdsPlayerWasOn.has(m.teamB.id));
    
    saveData(data);
    return data;
  },

  async createTeam(team: Omit<Team, 'id'>): Promise<Team[]> {
    await sleep(300);
    const data = getInitialData();
    const newTeam = { ...team, id: `t${Date.now()}` };
    data.teams.push(newTeam);
    saveData(data);
    return data.teams;
  },

  async deleteTeam(teamId: string): Promise<AppData> {
    await sleep(300);
    const data = getInitialData();
    data.teams = data.teams.filter(t => t.id !== teamId);
    data.groups = data.groups.map(g => ({ ...g, teams: g.teams.filter(t => t.id !== teamId) }));
    data.matches = data.matches.filter(m => m.teamA.id !== teamId && m.teamB.id !== teamId);
    saveData(data);
    return data;
  },
  
  async updateGroups(groups: Group[]): Promise<Group[]> {
    await sleep(300);
    const data = getInitialData();
    data.groups = groups;
    saveData(data);
    return data.groups;
  },

  async generateFixtures(): Promise<Match[]> {
    await sleep(500);
    const data = getInitialData();
    if(data.matches.length > 0) return data.matches;
    
    const newMatches: Match[] = [];
    let matchCount = 0;
    data.groups.forEach(group => {
      const groupTeams = group.teams;
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          newMatches.push({
            id: `m${Date.now() + matchCount++}`,
            teamA: groupTeams[i],
            teamB: groupTeams[j],
            score: { teamA: 0, teamB: 0 },
            games: [],
            status: 'scheduled',
          });
        }
      }
    });
    data.matches = newMatches;
    saveData(data);
    return data.matches;
  },

  async setMatchScore(matchId: string, teamKey: 'teamA' | 'teamB', newScore: number): Promise<Match[]> {
     await sleep(50);
     const data = getInitialData();
     const matches = data.matches.map((m): Match => {
      if (m.id === matchId && m.status !== 'completed') {
        const scoreValue = Math.max(0, newScore);
        return { ...m, status: 'in-progress', score: { ...m.score, [teamKey]: scoreValue } };
      }
      return m;
    });
    data.matches = matches;
    saveData(data);
    return data.matches;
  },
  
  async completeMatch(matchId: string, winner: Team): Promise<Match[]> {
     await sleep(300);
     const data = getInitialData();
     const matches = data.matches.map((m): Match => {
      if (m.id === matchId) {
        return { ...m, status: 'completed', winner };
      }
      return m;
    });
    data.matches = matches;
    saveData(data);
    return data.matches;
  },

  async reopenMatch(matchId: string): Promise<Match[]> {
    await sleep(300);
    const data = getInitialData();
    const matches = data.matches.map((m): Match => {
     if (m.id === matchId && m.status === 'completed') {
       const { winner, ...rest } = m;
       return { ...rest, status: 'in-progress' };
     }
     return m;
   });
   data.matches = matches;
   saveData(data);
   return data.matches;
  },

  resetTournamentData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear data from localStorage", error);
    }
  }
};