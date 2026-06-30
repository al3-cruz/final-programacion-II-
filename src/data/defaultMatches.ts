import { Match } from '../types';

export const DEFAULT_GROUP_MATCHES: Match[] = [
  { id: 'g-1', round: 'grupos', group: 'A', date: '11/06/2026', time: '15:00', local: 'México', visitor: 'Sudáfrica', localGoals: 2, visitorGoals: 0 },
  { id: 'g-2', round: 'grupos', group: 'A', date: '11/06/2026', time: '22:00', local: 'Corea del sur', visitor: 'Chequia', localGoals: 2, visitorGoals: 1 },
  { id: 'g-3', round: 'grupos', group: 'A', date: '18/06/2026', time: '12:00', local: 'Chequia', visitor: 'Sudáfrica', localGoals: null, visitorGoals: null },
  { id: 'g-4', round: 'grupos', group: 'A', date: '18/06/2026', time: '21:00', local: 'México', visitor: 'Corea del sur', localGoals: null, visitorGoals: null },
  { id: 'g-5', round: 'grupos', group: 'A', date: '24/06/2026', time: '21:00', local: 'Chequia', visitor: 'México', localGoals: null, visitorGoals: null },
  { id: 'g-6', round: 'grupos', group: 'A', date: '24/06/2026', time: '15:00', local: 'Sudáfrica', visitor: 'Corea del sur', localGoals: null, visitorGoals: null },

  { id: 'g-7', round: 'grupos', group: 'B', date: '12/06/2026', time: '15:00', local: 'Canadá', visitor: 'Bosnia', localGoals: 1, visitorGoals: 1 },
  { id: 'g-8', round: 'grupos', group: 'B', date: '13/06/2026', time: '15:00', local: 'Catar', visitor: 'Suiza', localGoals: 1, visitorGoals: 1 },
  { id: 'g-9', round: 'grupos', group: 'B', date: '18/06/2026', time: '15:00', local: 'Suiza', visitor: 'Bosnia', localGoals: null, visitorGoals: null },
  { id: 'g-10', round: 'grupos', group: 'B', date: '18/06/2026', time: '18:00', local: 'Canadá', visitor: 'Catar', localGoals: null, visitorGoals: null },
  { id: 'g-11', round: 'grupos', group: 'B', date: '24/06/2026', time: '15:00', local: 'Suiza', visitor: 'Canadá', localGoals: null, visitorGoals: null },
  { id: 'g-12', round: 'grupos', group: 'B', date: '21/06/2026', time: '12:00', local: 'Bosnia', visitor: 'Catar', localGoals: null, visitorGoals: null },

  { id: 'g-13', round: 'grupos', group: 'C', date: '13/06/2026', time: '18:00', local: 'Brasil', visitor: 'Marruecos', localGoals: 1, visitorGoals: 1 },
  { id: 'g-14', round: 'grupos', group: 'C', date: '13/06/2026', time: '21:00', local: 'Haití', visitor: 'Escocia', localGoals: 0, visitorGoals: 1 },
  { id: 'g-15', round: 'grupos', group: 'C', date: '19/06/2026', time: '18:00', local: 'Escocia', visitor: 'Marruecos', localGoals: null, visitorGoals: null },
  { id: 'g-16', round: 'grupos', group: 'C', date: '19/06/2026', time: '21:00', local: 'Brasil', visitor: 'Haití', localGoals: null, visitorGoals: null },
  { id: 'g-17', round: 'grupos', group: 'C', date: '24/06/2026', time: '18:00', local: 'Escocia', visitor: 'Brasil', localGoals: null, visitorGoals: null },
  { id: 'g-18', round: 'grupos', group: 'C', date: '24/06/2026', time: '15:00', local: 'Marruecos', visitor: 'Haití', localGoals: null, visitorGoals: null },

  { id: 'g-19', round: 'grupos', group: 'D', date: '12/06/2026', time: '21:00', local: 'Estados Unidos', visitor: 'Paraguay', localGoals: 4, visitorGoals: 1 },
  { id: 'g-20', round: 'grupos', group: 'D', date: '13/06/2026', time: '00:00', local: 'Australia', visitor: 'Turquía', localGoals: 2, visitorGoals: 0 },
  { id: 'g-21', round: 'grupos', group: 'D', date: '19/06/2026', time: '15:00', local: 'Estados Unidos', visitor: 'Australia', localGoals: null, visitorGoals: null },
  { id: 'g-22', round: 'grupos', group: 'D', date: '19/06/2026', time: '00:00', local: 'Turquía', visitor: 'Paraguay', localGoals: null, visitorGoals: null },
  { id: 'g-23', round: 'grupos', group: 'D', date: '25/06/2026', time: '22:00', local: 'Turquía', visitor: 'Estados Unidos', localGoals: null, visitorGoals: null },
  { id: 'g-24', round: 'grupos', group: 'D', date: '25/06/2026', time: '22:00', local: 'Paraguay', visitor: 'Australia', localGoals: null, visitorGoals: null },

  { id: 'g-25', round: 'grupos', group: 'E', date: '14/06/2026', time: '13:00', local: 'Alemania', visitor: 'Curazao', localGoals: 7, visitorGoals: 1 },
  { id: 'g-26', round: 'grupos', group: 'E', date: '14/06/2026', time: '19:00', local: 'Costa de Marfil', visitor: 'Ecuador', localGoals: 1, visitorGoals: 0 },
  { id: 'g-27', round: 'grupos', group: 'E', date: '20/06/2026', time: '16:00', local: 'Alemania', visitor: 'Costa de Marfil', localGoals: null, visitorGoals: null },
  { id: 'g-28', round: 'grupos', group: 'E', date: '20/06/2026', time: '22:00', local: 'Ecuador', visitor: 'Curazao', localGoals: null, visitorGoals: null },
  { id: 'g-29', round: 'grupos', group: 'E', date: '25/06/2026', time: '16:00', local: 'Curazao', visitor: 'Costa de Marfil', localGoals: null, visitorGoals: null },
  { id: 'g-30', round: 'grupos', group: 'E', date: '25/06/2026', time: '16:00', local: 'Ecuador', visitor: 'Alemania', localGoals: null, visitorGoals: null },

  { id: 'g-31', round: 'grupos', group: 'F', date: '14/06/2026', time: '16:00', local: 'Países Bajos', visitor: 'Japón', localGoals: 2, visitorGoals: 2 },
  { id: 'g-32', round: 'grupos', group: 'F', date: '14/06/2026', time: '22:00', local: 'Suecia', visitor: 'Túnez', localGoals: 5, visitorGoals: 1 },
  { id: 'g-33', round: 'grupos', group: 'F', date: '20/06/2026', time: '13:00', local: 'Países Bajos', visitor: 'Suecia', localGoals: null, visitorGoals: null },
  { id: 'g-34', round: 'grupos', group: 'F', date: '20/06/2026', time: '00:00', local: 'Túnez', visitor: 'Japón', localGoals: null, visitorGoals: null },
  { id: 'g-35', round: 'grupos', group: 'F', date: '25/06/2026', time: '19:00', local: 'Japón', visitor: 'Suecia', localGoals: null, visitorGoals: null },
  { id: 'g-36', round: 'grupos', group: 'F', date: '25/06/2026', time: '19:00', local: 'Túnez', visitor: 'Países Bajos', localGoals: null, visitorGoals: null },

  { id: 'g-37', round: 'grupos', group: 'G', date: '15/06/2026', time: '15:00', local: 'Bélgica', visitor: 'Egipto', localGoals: 1, visitorGoals: 1 },
  { id: 'g-38', round: 'grupos', group: 'G', date: '15/06/2026', time: '21:00', local: 'Irán', visitor: 'Nueva Zelanda', localGoals: 2, visitorGoals: 2 },
  { id: 'g-39', round: 'grupos', group: 'G', date: '21/06/2026', time: '15:00', local: 'Bélgica', visitor: 'Irán', localGoals: null, visitorGoals: null },
  { id: 'g-40', round: 'grupos', group: 'G', date: '21/06/2026', time: '21:00', local: 'Nueva Zelanda', visitor: 'Egipto', localGoals: null, visitorGoals: null },
  { id: 'g-41', round: 'grupos', group: 'G', date: '26/06/2026', time: '23:00', local: 'Egipto', visitor: 'Irán', localGoals: null, visitorGoals: null },
  { id: 'g-42', round: 'grupos', group: 'G', date: '26/06/2026', time: '23:00', local: 'Nueva Zelanda', visitor: 'Bélgica', localGoals: null, visitorGoals: null },

  { id: 'g-43', round: 'grupos', group: 'H', date: '15/06/2026', time: '12:00', local: 'España', visitor: 'Cabo Verde', localGoals: 0, visitorGoals: 0 },
  { id: 'g-44', round: 'grupos', group: 'H', date: '15/06/2026', time: '18:00', local: 'Arabia Saudí', visitor: 'Uruguay', localGoals: 1, visitorGoals: 1 },
  { id: 'g-45', round: 'grupos', group: 'H', date: '21/06/2026', time: '12:00', local: 'España', visitor: 'Arabia Saudí', localGoals: null, visitorGoals: null },
  { id: 'g-46', round: 'grupos', group: 'H', date: '21/06/2026', time: '18:00', local: 'Uruguay', visitor: 'Cabo Verde', localGoals: null, visitorGoals: null },
  { id: 'g-47', round: 'grupos', group: 'H', date: '26/06/2026', time: '20:00', local: 'Cabo Verde', visitor: 'Arabia Saudí', localGoals: null, visitorGoals: null },
  { id: 'g-48', round: 'grupos', group: 'H', date: '26/06/2026', time: '20:00', local: 'Uruguay', visitor: 'España', localGoals: null, visitorGoals: null },

  { id: 'g-49', round: 'grupos', group: 'I', date: '16/06/2026', time: '15:00', local: 'Francia', visitor: 'Senegal', localGoals: 3, visitorGoals: 1 },
  { id: 'g-50', round: 'grupos', group: 'I', date: '16/06/2026', time: '18:00', local: 'Irak', visitor: 'Noruega', localGoals: 1, visitorGoals: 4 },
  { id: 'g-51', round: 'grupos', group: 'I', date: '22/06/2026', time: '17:00', local: 'Francia', visitor: 'Irak', localGoals: null, visitorGoals: null },
  { id: 'g-52', round: 'grupos', group: 'I', date: '26/06/2026', time: '20:00', local: 'Noruega', visitor: 'Senegal', localGoals: null, visitorGoals: null },
  { id: 'g-53', round: 'grupos', group: 'I', date: '26/06/2026', time: '15:00', local: 'Noruega', visitor: 'Francia', localGoals: null, visitorGoals: null },
  { id: 'g-54', round: 'grupos', group: 'I', date: '20/06/2026', time: '15:00', local: 'Senegal', visitor: 'Irak', localGoals: null, visitorGoals: null },

  { id: 'g-55', round: 'grupos', group: 'J', date: '16/06/2026', time: '21:00', local: 'Argentina', visitor: 'Argelia', localGoals: 3, visitorGoals: 0 },
  { id: 'g-56', round: 'grupos', group: 'J', date: '16/06/2026', time: '00:00', local: 'Austria', visitor: 'Jordania', localGoals: 3, visitorGoals: 1 },
  { id: 'g-57', round: 'grupos', group: 'J', date: '22/06/2026', time: '13:00', local: 'Argentina', visitor: 'Austria', localGoals: null, visitorGoals: null },
  { id: 'g-58', round: 'grupos', group: 'J', date: '22/06/2026', time: '23:00', local: 'Jordania', visitor: 'Argelia', localGoals: null, visitorGoals: null },
  { id: 'g-59', round: 'grupos', group: 'J', date: '27/06/2026', time: '22:00', local: 'Argelia', visitor: 'Austria', localGoals: null, visitorGoals: null },
  { id: 'g-60', round: 'grupos', group: 'J', date: '27/06/2026', time: '22:00', local: 'Jordania', visitor: 'Argentina', localGoals: null, visitorGoals: null },

  { id: 'g-61', round: 'grupos', group: 'K', date: '17/06/2026', time: '13:00', local: 'Portugal', visitor: 'RD Congo', localGoals: 1, visitorGoals: 1 },
  { id: 'g-62', round: 'grupos', group: 'K', date: '17/06/2026', time: '22:00', local: 'Uzbekistán', visitor: 'Colombia', localGoals: null, visitorGoals: null },
  { id: 'g-63', round: 'grupos', group: 'K', date: '23/06/2026', time: '13:00', local: 'Portugal', visitor: 'Uzbekistán', localGoals: null, visitorGoals: null },
  { id: 'g-64', round: 'grupos', group: 'K', date: '23/06/2026', time: '22:00', local: 'Colombia', visitor: 'RD Congo', localGoals: null, visitorGoals: null },
  { id: 'g-65', round: 'grupos', group: 'K', date: '27/06/2026', time: '19:30', local: 'Colombia', visitor: 'Portugal', localGoals: null, visitorGoals: null },
  { id: 'g-66', round: 'grupos', group: 'K', date: '27/06/2026', time: '19:30', local: 'RD Congo', visitor: 'Uzbekistán', localGoals: null, visitorGoals: null },

  { id: 'g-67', round: 'grupos', group: 'L', date: '17/06/2026', time: '16:00', local: 'Inglaterra', visitor: 'Croacia', localGoals: 4, visitorGoals: 2 },
  { id: 'g-68', round: 'grupos', group: 'L', date: '17/06/2026', time: '19:00', local: 'Ghana', visitor: 'Panamá', localGoals: 1, visitorGoals: 0 },
  { id: 'g-69', round: 'grupos', group: 'L', date: '23/06/2026', time: '16:00', local: 'Inglaterra', visitor: 'Ghana', localGoals: null, visitorGoals: null },
  { id: 'g-70', round: 'grupos', group: 'L', date: '23/06/2026', time: '19:00', local: 'Panamá', visitor: 'Croacia', localGoals: null, visitorGoals: null },
  { id: 'g-71', round: 'grupos', group: 'L', date: '27/06/2026', time: '17:00', local: 'Panamá', visitor: 'Inglaterra', localGoals: null, visitorGoals: null },
  { id: 'g-72', round: 'grupos', group: 'L', date: '27/06/2026', time: '17:00', local: 'Croacia', visitor: 'Ghana', localGoals: null, visitorGoals: null }
];

export const DEFAULT_ELIMINATION_TEMPLATES: Record<string, Match[]> = {
  dieciseisavos: [
    { id: '16avos-1', round: 'dieciseisavos', date: '28/06/2026', time: '15:00', local: 'Sudáfrica', visitor: 'Canadá', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-2', round: 'dieciseisavos', date: '29/06/2026', time: '13:00', local: 'Brasil', visitor: 'Japón', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-3', round: 'dieciseisavos', date: '29/06/2026', time: '16:30', local: 'Alemania', visitor: 'Paraguay', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-4', round: 'dieciseisavos', date: '29/06/2026', time: '21:00', local: 'Países Bajos', visitor: 'Marruecos', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-5', round: 'dieciseisavos', date: '30/06/2026', time: '13:00', local: 'Costa de Marfil', visitor: 'Noruega', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-6', round: 'dieciseisavos', date: '30/06/2026', time: '17:00', local: 'Francia', visitor: 'Suecia', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-7', round: 'dieciseisavos', date: '30/06/2026', time: '21:00', local: 'México', visitor: 'Ecuador', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-8', round: 'dieciseisavos', date: '01/07/2026', time: '12:00', local: 'Inglaterra', visitor: 'RD Congo', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-9', round: 'dieciseisavos', date: '01/07/2026', time: '16:00', local: 'Bélgica', visitor: 'Senegal', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-10', round: 'dieciseisavos', date: '01/07/2026', time: '20:00', local: 'Estados Unidos', visitor: 'BiH', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-11', round: 'dieciseisavos', date: '02/07/2026', time: '15:00', local: 'España', visitor: 'Austria', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-12', round: 'dieciseisavos', date: '02/07/2026', time: '19:00', local: 'Portugal', visitor: 'Croacia', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-13', round: 'dieciseisavos', date: '02/07/2026', time: '23:00', local: 'Suiza', visitor: 'Argelia', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-14', round: 'dieciseisavos', date: '03/07/2026', time: '14:00', local: 'Australia', visitor: 'Egipto', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-15', round: 'dieciseisavos', date: '03/07/2026', time: '18:00', local: 'Argentina', visitor: 'Cabo Verde', localGoals: null, visitorGoals: null, advancingTeam: null },
    { id: '16avos-16', round: 'dieciseisavos', date: '03/07/2026', time: '21:30', local: 'Colombia', visitor: 'Ghana', localGoals: null, visitorGoals: null, advancingTeam: null }
  ],
  octavos: Array.from({ length: 8 }).map((_, i) => ({
    id: `octavos-${i + 1}`,
    round: 'octavos',
    date: '04/07/2026',
    time: i % 2 === 0 ? '15:00' : '19:00',
    local: `Ganador 16avos ${2 * i + 1}`,
    visitor: `Ganador 16avos ${2 * i + 2}`,
    localGoals: null,
    visitorGoals: null,
    advancingTeam: null
  })),
  cuartos: Array.from({ length: 4 }).map((_, i) => ({
    id: `cuartos-${i + 1}`,
    round: 'cuartos',
    date: '09/07/2026',
    time: i % 2 === 0 ? '15:00' : '19:00',
    local: `Ganador Octavos ${2 * i + 1}`,
    visitor: `Ganador Octavos ${2 * i + 2}`,
    localGoals: null,
    visitorGoals: null,
    advancingTeam: null
  })),
  semifinales: Array.from({ length: 2 }).map((_, i) => ({
    id: `semis-${i + 1}`,
    round: 'semifinales',
    date: '14/07/2026',
    time: '18:00',
    local: `Ganador Cuartos ${2 * i + 1}`,
    visitor: `Ganador Cuartos ${2 * i + 2}`,
    localGoals: null,
    visitorGoals: null,
    advancingTeam: null
  })),
  tercer_puesto: [
    {
      id: '3er-puesto-1',
      round: 'tercer_puesto',
      date: '18/07/2026',
      time: '16:00',
      local: 'Perdedor Semi 1',
      visitor: 'Perdedor Semi 2',
      localGoals: null,
      visitorGoals: null,
      advancingTeam: null
    }
  ],
  final: [
    {
      id: 'final-1',
      round: 'final',
      date: '19/07/2026',
      time: '16:00',
      local: 'Ganador Semi 1',
      visitor: 'Ganador Semi 2',
      localGoals: null,
      visitorGoals: null,
      advancingTeam: null
    }
  ]
};

export const ALL_DEFAULT_MATCHES = [
  ...DEFAULT_GROUP_MATCHES,
  ...DEFAULT_ELIMINATION_TEMPLATES.dieciseisavos,
  ...DEFAULT_ELIMINATION_TEMPLATES.octavos,
  ...DEFAULT_ELIMINATION_TEMPLATES.cuartos,
  ...DEFAULT_ELIMINATION_TEMPLATES.semifinales,
  ...DEFAULT_ELIMINATION_TEMPLATES.tercer_puesto,
  ...DEFAULT_ELIMINATION_TEMPLATES.final
];
