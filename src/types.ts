export type RoundId =
  | 'grupos'
  | 'dieciseisavos'
  | 'octavos'
  | 'cuartos'
  | 'semifinales'
  | 'tercer_puesto'
  | 'final';

export interface Match {
  id: string; // unique ID like "grupos-1", "16avos-1"
  round: RoundId;
  group?: string; // Group A, B, etc.
  date: string; // "DD/MM/YYYY"
  time: string; // "HH:MM"
  local: string;
  visitor: string;
  localGoals?: number | null;
  visitorGoals?: number | null;
  advancingTeam?: string | null; // For elimination rounds
}

export interface Prediction {
  matchId: string;
  localGoals: number;
  visitorGoals: number;
  advancingTeam?: string | null; // Predicted advancing team for elimination rounds
}

export interface Player {
  id: string;
  name: string;
  predictions: Record<string, Prediction>; // keyed by matchId
  deliveryTimeByRound: Record<RoundId, string>; // ISO timestamp of submission for each round
  isEliminated: boolean;
  eliminatedInRound?: RoundId;
}

export interface RoundInfo {
  id: RoundId;
  name: string;
  matchesCount: number;
  deadline: string; // Readable text, e.g., "11 de junio de 2026, 12:00" (Bolivian Time)
  deadlineISO: string; // ISO 8601 string for comparison
  eliminatedCount: number; // Number of players eliminated at the end of this phase
  maxCarryOverBonus: Record<string, number>; // Bonus rules
}

export interface PlayerLeaderboardRow {
  playerId: string;
  playerName: string;
  roundScore: number;          // Score obtained exclusively in the current round (inc. actual predictions only)
  carryOverBonus: number;      // Bonus points dragged from the previous round
  totalRoundPoints: number;    // roundScore + carryOverBonus
  exactHitsInRound: number;    // Number of exact scores in current round
  totalExactHitsCumulative: number; // Cumulative exact scores up to the current round
  previousRoundScore: number;  // Score in previous round (without carry-over) - used for tiebreaker
  previousExactHits: number;   // Exact scores in previous round - used for tiebreaker
  deliveryTime: string;        // Delivery timestamp for current round
  isEliminated: boolean;       // Is currently eliminated
  rank: number;                // Ranking in this round
  tieBreakReason?: string;     // Reason for why they rank above another in case of same total points
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
