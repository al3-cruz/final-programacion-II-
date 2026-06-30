import { Match } from '../types';

export interface TeamStats {
  flag: string;
  fifaRank: number;
  fairPlayScore: number;
}

export const TEAM_STATS: Record<string, TeamStats> = {
  'México': { flag: '🇲🇽', fifaRank: 15, fairPlayScore: 3 },
  'Sudáfrica': { flag: '🇿🇦', fifaRank: 59, fairPlayScore: 4 },
  'Corea del sur': { flag: '🇰🇷', fifaRank: 23, fairPlayScore: 3 },
  'Chequia': { flag: '🇨🇿', fifaRank: 36, fairPlayScore: 3 },
  'Canadá': { flag: '🇨🇦', fifaRank: 49, fairPlayScore: 3 },
  'Bosnia': { flag: '🇧🇦', fifaRank: 74, fairPlayScore: 4 },
  'BiH': { flag: '🇧🇦', fifaRank: 74, fairPlayScore: 4 },
  'Catar': { flag: '🇶🇦', fifaRank: 35, fairPlayScore: 5 },
  'Suiza': { flag: '🇨🇭', fifaRank: 19, fairPlayScore: 3 },
  'Brasil': { flag: '🇧🇷', fifaRank: 5, fairPlayScore: 4 },
  'Marruecos': { flag: '🇲🇦', fifaRank: 13, fairPlayScore: 4 },
  'Haití': { flag: '🇭🇹', fifaRank: 90, fairPlayScore: 3 },
  'Escocia': { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', fifaRank: 39, fairPlayScore: 4 },
  'Estados Unidos': { flag: '🇺🇸', fifaRank: 14, fairPlayScore: 3 },
  'Paraguay': { flag: '🇵🇾', fifaRank: 56, fairPlayScore: 5 },
  'Australia': { flag: '🇦🇺', fifaRank: 24, fairPlayScore: 4 },
  'Turquía': { flag: '🇹🇷', fifaRank: 28, fairPlayScore: 5 },
  'Alemania': { flag: '🇩🇪', fifaRank: 16, fairPlayScore: 3 },
  'Curazao': { flag: '🇨🇼', fifaRank: 85, fairPlayScore: 3 },
  'Costa de Marfil': { flag: '🇨🇮', fifaRank: 38, fairPlayScore: 4 },
  'Ecuador': { flag: '🇪🇨', fifaRank: 31, fairPlayScore: 4 },
  'Países Bajos': { flag: '🇳🇱', fifaRank: 7, fairPlayScore: 5 },
  'Japón': { flag: '🇯🇵', fifaRank: 18, fairPlayScore: 1 },
  'Suecia': { flag: '🇸🇪', fifaRank: 25, fairPlayScore: 2 },
  'Túnez': { flag: '🇹🇳', fifaRank: 41, fairPlayScore: 5 },
  'Bélgica': { flag: '🇧🇪', fifaRank: 3, fairPlayScore: 4 },
  'Egipto': { flag: '🇪🇬', fifaRank: 37, fairPlayScore: 5 },
  'Irán': { flag: '🇮🇷', fifaRank: 20, fairPlayScore: 6 },
  'Nueva Zelanda': { flag: '🇳🇿', fifaRank: 103, fairPlayScore: 2 },
  'España': { flag: '🇪🇸', fifaRank: 8, fairPlayScore: 2 },
  'Cabo Verde': { flag: '🇨🇻', fifaRank: 65, fairPlayScore: 3 },
  'Arabia Saudí': { flag: '🇸🇦', fifaRank: 53, fairPlayScore: 4 },
  'Uruguay': { flag: '🇺🇾', fifaRank: 11, fairPlayScore: 6 },
  'Francia': { flag: '🇫🇷', fifaRank: 2, fairPlayScore: 2 },
  'Senegal': { flag: '🇸🇳', fifaRank: 17, fairPlayScore: 5 },
  'Irak': { flag: '🇮🇶', fifaRank: 58, fairPlayScore: 5 },
  'Noruega': { flag: '🇳🇴', fifaRank: 47, fairPlayScore: 3 },
  'Argentina': { flag: '🇦🇷', fifaRank: 1, fairPlayScore: 3 },
  'Argelia': { flag: '🇩🇿', fifaRank: 44, fairPlayScore: 6 },
  'Austria': { flag: '🇦🇹', fifaRank: 22, fairPlayScore: 4 },
  'Jordania': { flag: '🇯🇴', fifaRank: 71, fairPlayScore: 4 },
  'Portugal': { flag: '🇵🇹', fifaRank: 6, fairPlayScore: 4 },
  'RD Congo': { flag: '🇨🇩', fifaRank: 61, fairPlayScore: 4 },
  'Uzbekistán': { flag: '🇺🇿', fifaRank: 64, fairPlayScore: 3 },
  'Colombia': { flag: '🇨🇴', fifaRank: 12, fairPlayScore: 5 },
  'Inglaterra': { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', fifaRank: 4, fairPlayScore: 2 },
  'Croacia': { flag: '🇭🇷', fifaRank: 10, fairPlayScore: 4 },
  'Ghana': { flag: '🇬🇭', fifaRank: 68, fairPlayScore: 5 },
  'Panamá': { flag: '🇵🇦', fifaRank: 43, fairPlayScore: 5 },
};

export interface GroupStandingRow {
  team: string;
  flag: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gd: number;
  gs: number;
  ga: number;
  pts: number;
  lastFive: { outcome: 'W' | 'D' | 'L' | 'P'; local: string; visitor: string; localGoals: number | null; visitorGoals: number | null; }[];
  fifaRank: number;
  fairPlayScore: number;
  isQualified?: boolean;
}

const parseDateTime = (dStr: string, tStr: string) => {
  const [d, m, y] = dStr.split('/').map(Number);
  const [hr, min] = tStr.split(':').map(Number);
  return new Date(y, m - 1, d, hr, min).getTime();
};

const getH2HStats = (teamName: string, tiedNames: string[], matches: Match[]) => {
  let h2hPts = 0;
  let h2hGD = 0;
  let h2hGS = 0;
  matches.forEach(m => {
    if (m.localGoals !== null && m.visitorGoals !== null) {
      if (tiedNames.includes(m.local) && tiedNames.includes(m.visitor)) {
        if (m.local === teamName) {
          h2hGS += m.localGoals;
          h2hGD += (m.localGoals - m.visitorGoals);
          if (m.localGoals > m.visitorGoals) h2hPts += 3;
          else if (m.localGoals === m.visitorGoals) h2hPts += 1;
        } else if (m.visitor === teamName) {
          h2hGS += m.visitorGoals;
          h2hGD += (m.visitorGoals - m.localGoals);
          if (m.visitorGoals > m.localGoals) h2hPts += 3;
          else if (m.localGoals === m.visitorGoals) h2hPts += 1;
        }
      }
    }
  });
  return { h2hPts, h2hGD, h2hGS };
};

export const calculateGroupStandings = (allMatches: Match[]): Record<string, GroupStandingRow[]> => {
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const standings: Record<string, GroupStandingRow[]> = {};

  groups.forEach(groupName => {
    const groupMatches = allMatches.filter(m => m.round === 'grupos' && m.group === groupName);
    
    // Sort chronologically for lastFive computation
    const chronoMatches = [...groupMatches].sort((a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time));
    
    const teamsSet = new Set<string>();
    groupMatches.forEach(m => {
      teamsSet.add(m.local);
      teamsSet.add(m.visitor);
    });
    const teams = Array.from(teamsSet);

    const rows: Record<string, GroupStandingRow> = {};
    teams.forEach(t => {
      rows[t] = {
        team: t,
        flag: TEAM_STATS[t]?.flag || '🏳️',
        p: 0, w: 0, d: 0, l: 0, gd: 0, gs: 0, ga: 0, pts: 0,
        lastFive: [],
        fifaRank: TEAM_STATS[t]?.fifaRank || 999,
        fairPlayScore: TEAM_STATS[t]?.fairPlayScore || 999
      };
    });

    chronoMatches.forEach(m => {
      if (m.localGoals !== null && m.localGoals !== undefined && m.visitorGoals !== null && m.visitorGoals !== undefined) {
        const lg = m.localGoals;
        const vg = m.visitorGoals;
        const local = rows[m.local];
        const visitor = rows[m.visitor];
        if (local && visitor) {
          local.p += 1;
          visitor.p += 1;
          local.gs += lg;
          local.ga += vg;
          visitor.gs += vg;
          visitor.ga += lg;
          local.gd = local.gs - local.ga;
          visitor.gd = visitor.gs - visitor.ga;

          if (lg > vg) {
            local.w += 1;
            local.pts += 3;
            visitor.l += 1;
          } else if (lg < vg) {
            visitor.w += 1;
            visitor.pts += 3;
            local.l += 1;
          } else {
            local.d += 1;
            visitor.d += 1;
            local.pts += 1;
            visitor.pts += 1;
          }
        }
      }
    });

    // Populate advanced lastFive array for each team (including played and pending)
    Object.values(rows).forEach(row => {
      const teamMatches = chronoMatches.filter(m => m.local === row.team || m.visitor === row.team);
      row.lastFive = teamMatches.map(m => {
        const isPlayed = m.localGoals !== null && m.localGoals !== undefined && m.visitorGoals !== null && m.visitorGoals !== undefined;
        let outcome: 'W' | 'D' | 'L' | 'P' = 'P';
        if (isPlayed) {
          if (m.local === row.team) {
            outcome = m.localGoals! > m.visitorGoals! ? 'W' : (m.localGoals! === m.visitorGoals! ? 'D' : 'L');
          } else {
            outcome = m.visitorGoals! > m.localGoals! ? 'W' : (m.localGoals! === m.visitorGoals! ? 'D' : 'L');
          }
        }
        return {
          outcome,
          local: m.local,
          visitor: m.visitor,
          localGoals: m.localGoals,
          visitorGoals: m.visitorGoals
        };
      });
    });

    const groupRows = Object.values(rows);

    // Sorting algorithm with dynamic H2H groups for tied points
    groupRows.sort((t1, t2) => {
      if (t2.pts !== t1.pts) return t2.pts - t1.pts;

      const tiedNames = groupRows.filter(r => r.pts === t1.pts).map(r => r.team);
      if (tiedNames.length > 1) {
        const h2h1 = getH2HStats(t1.team, tiedNames, chronoMatches);
        const h2h2 = getH2HStats(t2.team, tiedNames, chronoMatches);
        if (h2h2.h2hPts !== h2h1.h2hPts) return h2h2.h2hPts - h2h1.h2hPts;
        if (h2h2.h2hGD !== h2h1.h2hGD) return h2h2.h2hGD - h2h1.h2hGD;
        if (h2h2.h2hGS !== h2h1.h2hGS) return h2h2.h2hGS - h2h1.h2hGS;
      }

      if (t2.gd !== t1.gd) return t2.gd - t1.gd;
      if (t2.gs !== t1.gs) return t2.gs - t1.gs;
      if (t1.fairPlayScore !== t2.fairPlayScore) return t1.fairPlayScore - t2.fairPlayScore;
      return t1.fifaRank - t2.fifaRank;
    });

    standings[groupName] = groupRows;
  });

  return standings;
};

export const calculateBestThirds = (groupStandings: Record<string, GroupStandingRow[]>): (GroupStandingRow & { group: string })[] => {
  const thirds: (GroupStandingRow & { group: string })[] = [];
  Object.entries(groupStandings).forEach(([groupName, rows]) => {
    if (rows[2]) {
      thirds.push({
        ...rows[2],
        group: groupName
      });
    }
  });

  // Sort best thirds
  thirds.sort((t1, t2) => {
    if (t2.pts !== t1.pts) return t2.pts - t1.pts;
    if (t2.gd !== t1.gd) return t2.gd - t1.gd;
    if (t2.gs !== t1.gs) return t2.gs - t1.gs;
    if (t1.fairPlayScore !== t2.fairPlayScore) return t1.fairPlayScore - t2.fairPlayScore;
    return t1.fifaRank - t2.fifaRank;
  });

  return thirds;
};
