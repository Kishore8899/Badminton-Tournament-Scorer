
export enum Category {
  MensSingles = "Men's Singles",
  WomensSingles = "Women's Singles",
  MensDoubles = "Men's Doubles",
  WomensDoubles = "Women's Doubles",
  MixedDoubles = "Mixed Doubles",
}

export enum DominantHand {
  Left = 'Left',
  Right = 'Right',
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  categories: Category[];
  scoringRules: {
    pointsPerGame: number;
  };
}

export interface Player {
  id: string;
  name: string;
  age: number;
  dominantHand: DominantHand;
  contact: string;
}

export interface Team {
  id: string;
  name: string;
  category: Category;
  players: [Player] | [Player, Player];
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  score: {
    teamA: number;
    teamB: number;
  };
  games: { teamA: number; teamB: number }[]; // Score per game
  winner?: Team;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  category: Category;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifference: number;
  gamesWon: number;
}