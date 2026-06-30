import { Player, Prediction, RoundId } from '../types';

// Let's create seed predictions for the first 4 played matches:
// Match g-1: México vs Sudáfrica (2 - 0)
// Match g-2: Corea del sur vs Chequia (2 - 1)
// Match g-7: Canadá vs Bosnia (1 - 1)
// Match g-19: Estados Unidos vs Paraguay (4 - 1)

const createSeedPredictions = (
  p1: [number, number],
  p2: [number, number],
  p7: [number, number],
  p19: [number, number],
  restSeed: number // a base number to populate other matches randomly
): Record<string, Prediction> => {
  const preds: Record<string, Prediction> = {
    'g-1': { matchId: 'g-1', localGoals: p1[0], visitorGoals: p1[1] },
    'g-2': { matchId: 'g-2', localGoals: p2[0], visitorGoals: p2[1] },
    'g-7': { matchId: 'g-7', localGoals: p7[0], visitorGoals: p7[1] },
    'g-19': { matchId: 'g-19', localGoals: p19[0], visitorGoals: p19[1] },
  };

  // Populate other matches with reasonable mock values
  for (let idx = 3; idx <= 72; idx++) {
    const mId = `g-${idx}`;
    if (mId === 'g-7' || mId === 'g-19') continue;
    // Semi-random deterministic goals based on restSeed and idx
    const goalL = (restSeed + idx) % 3;
    const goalV = (restSeed * idx) % 2;
    preds[mId] = {
      matchId: mId,
      localGoals: goalL,
      visitorGoals: goalV,
    };
  }

  // Populate mock predictions for elimination rounds
  const eliminationRounds: { round: RoundId; key: string; count: number }[] = [
    { round: 'dieciseisavos', key: '16avos', count: 16 },
    { round: 'octavos', key: 'octavos', count: 8 },
    { round: 'cuartos', key: 'cuartos', count: 4 },
    { round: 'semifinales', key: 'semis', count: 2 },
    { round: 'tercer_puesto', key: '3er-puesto', count: 1 },
    { round: 'final', key: 'final', count: 1 },
  ];

  eliminationRounds.forEach(({ key, count }) => {
    for (let idx = 1; idx <= count; idx++) {
      const matchId = `${key}-${idx}`;
      const localGoals = (restSeed + idx + 1) % 3;
      const visitorGoals = (restSeed * idx + 2) % 3;
      const advancingTeam = localGoals >= visitorGoals ? 'Local' : 'Visitor';
      preds[matchId] = {
        matchId,
        localGoals,
        visitorGoals,
        advancingTeam,
      };
    }
  });

  return preds;
};

// Generate submission dates for all rounds for each player
const generateSubmissionTimes = (
  submissionOffsetMinutes: number
): Record<RoundId, string> => {
  // Let the base be June 11, 2026, 12:00 PM Bolivian Time.
  // Standard Bolivian Time offset is UTC-4:00.
  // We can write ISO timestamps:
  const baseGrupos = new Date('2026-06-11T12:00:00-04:00').getTime();
  const timeGrupos = new Date(baseGrupos - submissionOffsetMinutes * 60 * 1000).toISOString();

  const base16 = new Date('2026-06-28T12:00:00-04:00').getTime();
  const time16 = new Date(base16 - submissionOffsetMinutes * 60 * 1000).toISOString();

  const baseOctavos = new Date('2026-07-04T12:00:00-04:00').getTime();
  const timeOctavos = new Date(baseOctavos - submissionOffsetMinutes * 60 * 1000).toISOString();

  const baseCuartos = new Date('2026-07-09T12:00:00-04:00').getTime();
  const timeCuartos = new Date(baseCuartos - submissionOffsetMinutes * 60 * 1000).toISOString();

  const baseSemis = new Date('2026-07-14T12:00:00-04:00').getTime();
  const timeSemis = new Date(baseSemis - submissionOffsetMinutes * 60 * 1000).toISOString();

  const baseTercer = new Date('2026-07-18T12:00:00-04:00').getTime();
  const timeTercer = new Date(baseTercer - submissionOffsetMinutes * 60 * 1000).toISOString();

  const baseFinal = new Date('2026-07-19T12:00:00-04:00').getTime();
  const timeFinal = new Date(baseFinal - submissionOffsetMinutes * 60 * 1000).toISOString();

  return {
    grupos: timeGrupos,
    dieciseisavos: time16,
    octavos: timeOctavos,
    cuartos: timeCuartos,
    semifinales: timeSemis,
    tercer_puesto: timeTercer,
    final: timeFinal,
  };
};

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p-1',
    name: 'Alejandro',
    // Score tie details: 4 exact scores = 16 points.
    predictions: createSeedPredictions([2, 0], [2, 1], [1, 1], [4, 1], 1),
    deliveryTimeByRound: generateSubmissionTimes(150), // Submitted 150 minutes before group phase deadline (earliest)
    isEliminated: false,
  },
  {
    id: 'p-2',
    name: 'Manuel',
    // 4 exact scores = 16 points.
    predictions: createSeedPredictions([2, 0], [2, 1], [1, 1], [4, 1], 2),
    deliveryTimeByRound: generateSubmissionTimes(105), // Submitted 105 minutes before
    isEliminated: false,
  },
  {
    id: 'p-3',
    name: 'Richard',
    // 4 exact scores = 16 points.
    predictions: createSeedPredictions([2, 0], [2, 1], [1, 1], [4, 1], 3),
    deliveryTimeByRound: generateSubmissionTimes(60), // Submitted 60 minutes before
    isEliminated: false,
  },
  {
    id: 'p-4',
    name: 'Valentina',
    // 4 exact scores = 16 points.
    predictions: createSeedPredictions([2, 0], [2, 1], [1, 1], [4, 1], 4),
    deliveryTimeByRound: generateSubmissionTimes(15), // Submitted 15 minutes before (latest among tied top)
    isEliminated: false,
  },
  {
    id: 'p-5',
    name: 'Carlos',
    // 3 exact scores + 1 correct sign = 12 + 3 = 15 points
    predictions: createSeedPredictions([2, 0], [2, 1], [1, 1], [3, 0], 5),
    deliveryTimeByRound: generateSubmissionTimes(200),
    isEliminated: false,
  },
  {
    id: 'p-6',
    name: 'Daniel',
    // 1 exact score (Mexico 2-0) + 3 correct signs = 4 + 9 = 13 points
    predictions: createSeedPredictions([2, 0], [1, 0], [2, 2], [3, 0], 6),
    deliveryTimeByRound: generateSubmissionTimes(180),
    isEliminated: false,
  },
  {
    id: 'p-7',
    name: 'Eduardo',
    // 2 exact score + 1 correct sign + 1 wrong = 8 + 3 = 11 points
    predictions: createSeedPredictions([2, 0], [2, 1], [3, 1], [0, 2], 7),
    deliveryTimeByRound: generateSubmissionTimes(220),
    isEliminated: false,
  },
  {
    id: 'p-8',
    name: 'Gabriela',
    // 1 exact score + 2 correct sign + 1 wrong = 4 + 6 = 10 points
    predictions: createSeedPredictions([2, 0], [1, 0], [0, 0], [0, 2], 8),
    deliveryTimeByRound: generateSubmissionTimes(40),
    isEliminated: false,
  },
  {
    id: 'p-9',
    name: 'Andrés',
    // 3 correct signs + 1 wrong = 9 points
    predictions: createSeedPredictions([1, 0], [2, 0], [3, 3], [0, 3], 9),
    deliveryTimeByRound: generateSubmissionTimes(120),
    isEliminated: false,
  },
  {
    id: 'p-10',
    name: 'Sofía',
    // 2 correct signs + 2 wrong = 6 points
    predictions: createSeedPredictions([1, 0], [1, 0], [2, 0], [1, 2], 10),
    deliveryTimeByRound: generateSubmissionTimes(250),
    isEliminated: false,
  },
  {
    id: 'p-11',
    name: 'Javier',
    // 1 correct sign + 3 wrong = 3 points
    predictions: createSeedPredictions([1, 0], [0, 2], [3, 0], [1, 2], 11),
    deliveryTimeByRound: generateSubmissionTimes(300),
    isEliminated: false,
  },
];
