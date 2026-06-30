import { Match, Prediction, Player, PlayerLeaderboardRow, RoundId, RoundInfo } from '../types';

export const ROUNDS: RoundInfo[] = [
  {
    id: 'grupos',
    name: 'Fase de Grupos',
    matchesCount: 72,
    deadline: '11 de junio de 2026, 12:00',
    deadlineISO: '2026-06-11T12:00:00-04:00', // Bolivian Time (UTC-4)
    eliminatedCount: 2,
    maxCarryOverBonus: { '1': 3, '2': 2, '3': 1 }
  },
  {
    id: 'dieciseisavos',
    name: 'Dieciseisavos de Final',
    matchesCount: 16,
    deadline: '28 de junio de 2026, 12:00',
    deadlineISO: '2026-06-28T12:00:00-04:00',
    eliminatedCount: 2,
    maxCarryOverBonus: { '1': 3, '2': 2, '3': 1 }
  },
  {
    id: 'octavos',
    name: 'Octavos de Final',
    matchesCount: 8,
    deadline: '04 de julio de 2026, 12:00',
    deadlineISO: '2026-07-04T12:00:00-04:00',
    eliminatedCount: 2,
    maxCarryOverBonus: { '1': 2, '2': 1 } // Octavos to Cuartos exception: 1st (+2), 2nd (+1)
  },
  {
    id: 'cuartos',
    name: 'Cuartos de Final',
    matchesCount: 4,
    deadline: '09 de julio de 2026, 12:00',
    deadlineISO: '2026-07-09T12:00:00-04:00',
    eliminatedCount: 1,
    maxCarryOverBonus: { '1': 1 } // Cuartos to Semis exception: 1st (+1)
  },
  {
    id: 'semifinales',
    name: 'Semifinales',
    matchesCount: 2,
    deadline: '14 de julio de 2026, 12:00',
    deadlineISO: '2026-07-14T12:00:00-04:00',
    eliminatedCount: 1,
    maxCarryOverBonus: {} // Semis to 3er Puesto: 0 bonus
  },
  {
    id: 'tercer_puesto',
    name: 'Tercer Puesto',
    matchesCount: 1,
    deadline: '18 de julio de 2026, 12:00',
    deadlineISO: '2026-07-18T12:00:00-04:00',
    eliminatedCount: 1, // Eliminates 1 leaving 2 players for Final
    maxCarryOverBonus: {} // 3er Puesto to Final: 0 bonus
  },
  {
    id: 'final',
    name: 'Gran Final',
    matchesCount: 1,
    deadline: '19 de julio de 2026, 12:00',
    deadlineISO: '2026-07-19T12:00:00-04:00',
    eliminatedCount: 0,
    maxCarryOverBonus: {}
  }
];

/**
 * Calculates score and exact status of a prediction for a match.
 */
export function calculatePredictionScore(
  match: Match,
  prediction?: Prediction | null
): { score: number; isExact: boolean } {
  if (!prediction) return { score: 0, isExact: false };
  if (match.localGoals === null || match.localGoals === undefined ||
      match.visitorGoals === null || match.visitorGoals === undefined) {
    return { score: 0, isExact: false }; // No results yet
  }

  const actL = match.localGoals;
  const actV = match.visitorGoals;
  const predL = prediction.localGoals;
  const predV = prediction.visitorGoals;

  // Determine actual sign (90 mins result)
  let actualSign = 'E'; // Empate
  if (actL > actV) actualSign = 'L';
  else if (actL < actV) actualSign = 'V';

  // Determine predicted sign
  let predSign = 'E';
  if (predL > predV) predSign = 'L';
  else if (predL < predV) predSign = 'V';

  const signMatches = actualSign === predSign;
  const exactScoreMatches = actL === predL && actV === predV;

  if (match.round === 'grupos') {
    // Fase de grupos scoring:
    // 3 points for sign. +1 point extra for exact score
    if (signMatches) {
      const isExact = exactScoreMatches;
      const score = 3 + (isExact ? 1 : 0);
      return { score, isExact };
    }
    return { score: 0, isExact: false };
  } else {
    // Eliminatorias scoring:
    // 2 puntos adivinar al signo (90 minutos)
    // 2 puntos adivinar al que pasa (advancingTeam)
    // 1 punto al marcador exacto
    const actualAdv = match.advancingTeam;
    const predAdv = prediction.advancingTeam;

    const advancingMatches = Boolean(actualAdv && predAdv && actualAdv.toLowerCase() === predAdv.toLowerCase());

    let score = 0;
    if (signMatches) score += 2;
    if (advancingMatches) score += 2;
    if (exactScoreMatches) score += 1;

    return { score, isExact: exactScoreMatches };
  }
}

/**
 * Executes sequential tournament rounds logic, calculating player standings,
 * promotions, carry-over bonuses, and eliminations.
 */
export function calculateStandings(
  allMatches: Match[],
  players: Player[]
): Record<RoundId, PlayerLeaderboardRow[]> {
  // Deep copy players to prevent side-effect mutations on state/props
  const clonedPlayers = players.map(p => ({
    ...p,
  }));

  const standingsByRound = {} as Record<RoundId, PlayerLeaderboardRow[]>;

  // Track active players for each round. Starts with all 11 players.
  let activePlayerIds = new Set<string>(clonedPlayers.map(p => p.id));

  // Tracks carry-over bonus for each active player in the current step
  const carryOverForActive = {} as Record<string, number>;
  // Tracks stats accumulated across previous rounds for cumulative exacts tiebreaker
  const exactsHistory = {} as Record<string, Record<RoundId, number>>;
  const pointsHistory = {} as Record<string, Record<RoundId, number>>;

  clonedPlayers.forEach(p => {
    carryOverForActive[p.id] = 0;
    exactsHistory[p.id] = {} as Record<RoundId, number>;
    pointsHistory[p.id] = {} as Record<RoundId, number>;
  });

  // Calculate sequentially
  for (let rIdx = 0; rIdx < ROUNDS.length; rIdx++) {
    const round = ROUNDS[rIdx];
    const prevRound = rIdx > 0 ? ROUNDS[rIdx - 1] : null;

    const roundMatches = allMatches.filter(m => m.round === round.id);

    // Calculate details for each player active in this round
    const rows: PlayerLeaderboardRow[] = clonedPlayers.map(player => {
      const isCurrentlyActive = activePlayerIds.has(player.id);

      let roundScore = 0;
      let exactHitsInRound = 0;

      // Only active players score points in a round
      if (isCurrentlyActive) {
        roundMatches.forEach(match => {
          const pred = player.predictions[match.id];
          if (pred) {
            const { score, isExact } = calculatePredictionScore(match, pred);
            roundScore += score;
            if (isExact) exactHitsInRound += 1;
          }
        });
      }

      // Record history
      exactsHistory[player.id][round.id] = exactHitsInRound;
      pointsHistory[player.id][round.id] = roundScore;

      // Cumulative exact matches up to current round
      let totalExactHitsCumulative = 0;
      for (let j = 0; j <= rIdx; j++) {
        const rId = ROUNDS[j].id;
        totalExactHitsCumulative += exactsHistory[player.id][rId] || 0;
      }

      const carryOverBonus = isCurrentlyActive ? (carryOverForActive[player.id] || 0) : 0;
      const totalRoundPoints = roundScore + carryOverBonus;

      // Previous round metrics
      let previousRoundScore = 0;
      let previousExactHits = 0;
      if (prevRound) {
        previousRoundScore = pointsHistory[player.id][prevRound.id] || 0;
        previousExactHits = exactsHistory[player.id][prevRound.id] || 0;
      }

      return {
        playerId: player.id,
        playerName: player.name,
        roundScore,
        carryOverBonus,
        totalRoundPoints,
        exactHitsInRound,
        totalExactHitsCumulative,
        previousRoundScore,
        previousExactHits,
        deliveryTime: player.deliveryTimeByRound[round.id] || '',
        isEliminated: !isCurrentlyActive,
        rank: 99
      };
    });

    // Separates active and inactive players for sorting
    const activeRows = rows.filter(r => !r.isEliminated);
    const inactiveRows = rows.filter(r => r.isEliminated);

    // Sort active players based on strict tie-breaker criteria
    activeRows.sort((a, b) => {
      // Primary: Total points in the round (score + carryover)
      if (b.totalRoundPoints !== a.totalRoundPoints) {
        return b.totalRoundPoints - a.totalRoundPoints;
      }

      // Tiebreaker 1: Exact matches in selected round
      if (b.exactHitsInRound !== a.exactHitsInRound) {
        a.tieBreakReason = `Mayor Nº exactos en ronda actual (${a.exactHitsInRound} vs ${b.exactHitsInRound})`;
        b.tieBreakReason = `Menor Nº exactos en ronda actual (${b.exactHitsInRound} vs ${a.exactHitsInRound})`;
        return b.exactHitsInRound - a.exactHitsInRound;
      }

      // Tiebreaker 2: Cumulative exact matches in tournament
      if (b.totalExactHitsCumulative !== a.totalExactHitsCumulative) {
        a.tieBreakReason = `Mayor Nº exactos acumulados (${a.totalExactHitsCumulative} vs ${b.totalExactHitsCumulative})`;
        b.tieBreakReason = `Menor Nº exactos acumulados (${b.totalExactHitsCumulative} vs ${a.totalExactHitsCumulative})`;
        return b.totalExactHitsCumulative - a.totalExactHitsCumulative;
      }

      // Tiebreakers 3 & 4: Only apply from 16avos onwards
      if (round.id !== 'grupos') {
        // Tiebreaker 3: Previous round score (without carryover)
        if (b.previousRoundScore !== a.previousRoundScore) {
          a.tieBreakReason = `Mayor puntaje de ronda anterior (${a.previousRoundScore} vs ${b.previousRoundScore})`;
          b.tieBreakReason = `Menor puntaje de ronda anterior (${b.previousRoundScore} vs ${a.previousRoundScore})`;
          return b.previousRoundScore - a.previousRoundScore;
        }

        // Tiebreaker 4: Previous round exacts
        if (b.previousExactHits !== a.previousExactHits) {
          a.tieBreakReason = `Mayor Nº exactos de ronda anterior (${a.previousExactHits} vs ${b.previousExactHits})`;
          b.tieBreakReason = `Menor Nº exactos de ronda anterior (${b.previousExactHits} vs ${a.previousExactHits})`;
          return b.previousExactHits - a.previousExactHits;
        }
      }

      // Tiebreaker 5: Delivery time (earlier is better)
      const timeA = new Date(a.deliveryTime).getTime() || Infinity;
      const timeB = new Date(b.deliveryTime).getTime() || Infinity;
      if (timeA !== timeB) {
        a.tieBreakReason = 'DELIVERY_ORDER';
        b.tieBreakReason = 'DELIVERY_ORDER';
        return timeA - timeB; // ascending
      }

      // Tiebreaker 6: Alphabetical/Sorteo
      return a.playerName.localeCompare(b.playerName);
    });

    // Assign ranking numbers to active rows
    activeRows.forEach((row, index) => {
      row.rank = index + 1;
    });

    // Assemble final standings list for this round
    standingsByRound[round.id] = [...activeRows, ...inactiveRows];

    // Determine who survives to next round or gets eliminated
    if (activeRows.length > 0) {
      const survivorsCount = activeRows.length - round.eliminatedCount;
      const survivingRows = activeRows.slice(0, survivorsCount);
      const eliminatedRows = activeRows.slice(survivorsCount);

      // Map survivors to next round
      const nextActiveIds = new Set<string>();
      survivingRows.forEach(r => nextActiveIds.add(r.playerId));

      // Update carry-over values for next round
      // Reset all to 0
      players.forEach(p => { carryOverForActive[p.id] = 0; });

      // Apply bonuses to top standings in the current round among survivors
      // 1st: +3 (or round.maxCarryOverBonus['1']), 2nd: +2, 3rd: +1
      survivingRows.forEach((row, idx) => {
        const bonusRankStr = (idx + 1).toString();
        const bonusValue = round.maxCarryOverBonus[bonusRankStr] || 0;
        carryOverForActive[row.playerId] = bonusValue;
      });

      // Prepare for next iteration cycle
      activePlayerIds = nextActiveIds;

      // Mark the eliminated ones in player objects for downstream displays
      eliminatedRows.forEach(r => {
        const pObj = clonedPlayers.find(p => p.id === r.playerId);
        if (pObj) {
          pObj.isEliminated = true;
          pObj.eliminatedInRound = round.id;
        }
      });
    }
  }

  return standingsByRound;
}
