import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { DEFAULT_GROUP_MATCHES, DEFAULT_ELIMINATION_TEMPLATES } from '../src/data/defaultMatches';
import { Match } from '../src/types';

const MATCHES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'defaultMatches.ts');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Deep clone of imported structures so we can mutate them freely
const groupMatches: Match[] = JSON.parse(JSON.stringify(DEFAULT_GROUP_MATCHES));
const eliminationTemplates: Record<string, Match[]> = JSON.parse(JSON.stringify(DEFAULT_ELIMINATION_TEMPLATES));

function formatMatchLine(m: Match): string {
  const localGoalsStr = m.localGoals !== null ? m.localGoals : '-';
  const visitorGoalsStr = m.visitorGoals !== null ? m.visitorGoals : '-';
  let info = `${m.local} vs ${m.visitor} [${localGoalsStr} - ${visitorGoalsStr}]`;
  if (m.round !== 'grupos' && m.advancingTeam) {
    info += ` (Avanza: ${m.advancingTeam})`;
  }
  return info;
}

function formatMatchTypeScriptCode(m: Match): string {
  const parts = [
    `id: '${m.id}'`,
    `round: '${m.round}'`,
    m.group ? `group: '${m.group}'` : null,
    `date: '${m.date}'`,
    `time: '${m.time}'`,
    `local: '${m.local.replace(/'/g, "\\'")}'`,
    `visitor: '${m.visitor.replace(/'/g, "\\'")}'`,
    `localGoals: ${m.localGoals !== null ? m.localGoals : 'null'}`,
    `visitorGoals: ${m.visitorGoals !== null ? m.visitorGoals : 'null'}`
  ].filter(Boolean);

  if (m.round !== 'grupos') {
    parts.push(`advancingTeam: ${m.advancingTeam ? `'${m.advancingTeam.replace(/'/g, "\\'")}'` : 'null'}`);
  }

  return `  { ${parts.join(', ')} }`;
}

function saveMatchesToFile() {
  const groupMatchesContent = groupMatches.map(formatMatchTypeScriptCode).join(',\n');
  
  const dieciseisavosContent = eliminationTemplates.dieciseisavos.map(formatMatchTypeScriptCode).join(',\n');
  const octavosContent = eliminationTemplates.octavos.map(formatMatchTypeScriptCode).join(',\n');
  const cuartosContent = eliminationTemplates.cuartos.map(formatMatchTypeScriptCode).join(',\n');
  const semifinalesContent = eliminationTemplates.semifinales.map(formatMatchTypeScriptCode).join(',\n');
  const tercerPuestoContent = eliminationTemplates.tercer_puesto.map(formatMatchTypeScriptCode).join(',\n');
  const finalContent = eliminationTemplates.final.map(formatMatchTypeScriptCode).join(',\n');

  const fileContent = `import { Match } from '../types';

export const DEFAULT_GROUP_MATCHES: Match[] = [
${groupMatchesContent}
];

export const DEFAULT_ELIMINATION_TEMPLATES: Record<string, Match[]> = {
  dieciseisavos: [
${dieciseisavosContent}
  ],
  octavos: [
${octavosContent}
  ],
  cuartos: [
${cuartosContent}
  ],
  semifinales: [
${semifinalesContent}
  ],
  tercer_puesto: [
${tercerPuestoContent}
  ],
  final: [
${finalContent}
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
`;

  fs.writeFileSync(MATCHES_FILE_PATH, fileContent, 'utf-8');
}

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function showMainMenu() {
  while (true) {
    console.clear();
    console.log('====================================================');
    console.log('🏆   MUNDIAL 2026 - ACTUALIZADOR DE RESULTADOS   🏆');
    console.log('====================================================');
    console.log('1. Fase de Grupos');
    console.log('2. Dieciseisavos de Final');
    console.log('3. Octavos de Final');
    console.log('4. Cuartos de Final');
    console.log('5. Semifinales');
    console.log('6. Tercer Puesto');
    console.log('7. Final');
    console.log('8. Buscar partido por nombre de equipo');
    console.log('0. Guardar cambios y Salir');
    console.log('====================================================');

    const choice = await askQuestion('Seleccione una opción (0-8): ');

    if (choice === '0') {
      console.log('\n💾 Guardando resultados en defaultMatches.ts...');
      saveMatchesToFile();
      console.log('✨ ¡Cambios guardados correctamente!');
      console.log('💡 NOTA: Si ya habías abierto la aplicación en tu navegador, recuerda usar el botón');
      console.log('   "Restablecer" o borrar el almacenamiento local (localStorage) para ver los cambios reflejados.');
      rl.close();
      break;
    }

    switch (choice) {
      case '1':
        await handlePhaseMenu('grupos', groupMatches);
        break;
      case '2':
        await handlePhaseMenu('dieciseisavos', eliminationTemplates.dieciseisavos);
        break;
      case '3':
        await handlePhaseMenu('octavos', eliminationTemplates.octavos);
        break;
      case '4':
        await handlePhaseMenu('cuartos', eliminationTemplates.cuartos);
        break;
      case '5':
        await handlePhaseMenu('semifinales', eliminationTemplates.semifinales);
        break;
      case '6':
        await handlePhaseMenu('tercer_puesto', eliminationTemplates.tercer_puesto);
        break;
      case '7':
        await handlePhaseMenu('final', eliminationTemplates.final);
        break;
      case '8':
        await handleSearchMenu();
        break;
      default:
        console.log('\n❌ Opción no válida. Intente de nuevo.');
        await askQuestion('\nPresione Enter para continuar...');
    }
  }
}

async function handlePhaseMenu(phaseName: string, matchesList: Match[]) {
  while (true) {
    console.clear();
    console.log(`====================================================`);
    console.log(`📅 FASE: ${phaseName.toUpperCase()}`);
    console.log(`====================================================`);
    
    matchesList.forEach((m, idx) => {
      console.log(`${idx + 1}) ${formatMatchLine(m)}`);
    });
    
    console.log('0) Volver al Menú Principal');
    console.log(`====================================================`);

    const input = await askQuestion(`Seleccione el número de partido para actualizar (1-${matchesList.length}): `);
    if (input === '0') break;

    const idx = parseInt(input, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= matchesList.length) {
      console.log('\n❌ Número de partido inválido.');
      await askQuestion('\nPresione Enter para continuar...');
      continue;
    }

    await editMatch(matchesList[idx]);
    // Save state iteratively to avoid loss
    saveMatchesToFile();
  }
}

async function handleSearchMenu() {
  console.clear();
  console.log(`====================================================`);
  console.log(`🔍 BUSCAR PARTIDO`);
  console.log(`====================================================`);
  const query = await askQuestion('Ingrese el nombre de un equipo (o presione Enter para cancelar): ');
  if (!query.trim()) return;

  const searchResults: { match: Match; list: Match[]; originalIndex: number }[] = [];
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const searchInList = (list: Match[]) => {
    list.forEach((m, idx) => {
      const localNorm = m.local.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const visitorNorm = m.visitor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (localNorm.includes(normalizedQuery) || visitorNorm.includes(normalizedQuery)) {
        searchResults.push({ match: m, list, originalIndex: idx });
      }
    });
  };

  searchInList(groupMatches);
  searchInList(eliminationTemplates.dieciseisavos);
  searchInList(eliminationTemplates.octavos);
  searchInList(eliminationTemplates.cuartos);
  searchInList(eliminationTemplates.semifinales);
  searchInList(eliminationTemplates.tercer_puesto);
  searchInList(eliminationTemplates.final);

  if (searchResults.length === 0) {
    console.log('\n❌ No se encontraron partidos con ese equipo.');
    await askQuestion('\nPresione Enter para continuar...');
    return;
  }

  while (true) {
    console.clear();
    console.log(`====================================================`);
    console.log(`🔍 RESULTADOS DE BÚSQUEDA PARA: "${query}"`);
    console.log(`====================================================`);
    searchResults.forEach((res, idx) => {
      console.log(`${idx + 1}) [Fase: ${res.match.round.toUpperCase()}] ${formatMatchLine(res.match)}`);
    });
    console.log('0) Cancelar / Volver');
    console.log(`====================================================`);

    const input = await askQuestion(`Seleccione el número de partido para actualizar (1-${searchResults.length}): `);
    if (input === '0') break;

    const idx = parseInt(input, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= searchResults.length) {
      console.log('\n❌ Número inválido.');
      await askQuestion('\nPresione Enter para continuar...');
      continue;
    }

    const matchToEdit = searchResults[idx].match;
    await editMatch(matchToEdit);
    saveMatchesToFile();
    break; // Return after editing
  }
}

async function editMatch(m: Match) {
  console.clear();
  console.log(`====================================================`);
  console.log(`✏️  EDITANDO PARTIDO (ID: ${m.id})`);
  console.log(`====================================================`);
  console.log(`Partido actual: ${formatMatchLine(m)}`);
  console.log(`Fecha/Hora:     ${m.date} a las ${m.time}`);
  console.log(`====================================================\n`);

  // Allow renaming teams in elimination phases (e.g. replacing 'Ganador Octavos 1' with 'Brasil')
  if (m.round !== 'grupos') {
    const changeNames = await askQuestion('¿Desea cambiar los nombres de los equipos? (s/n): ');
    if (changeNames.toLowerCase() === 's') {
      const newLocal = await askQuestion(`Nombre equipo Local [Actual: ${m.local}]: `);
      if (newLocal.trim()) m.local = newLocal.trim();
      
      const newVisitor = await askQuestion(`Nombre equipo Visitante [Actual: ${m.visitor}]: `);
      if (newVisitor.trim()) m.visitor = newVisitor.trim();
    }
  }

  // Ask for goals local
  const localGoalsInput = await askQuestion(`Goles ${m.local} [Dejar vacío para mantener '${m.localGoals !== null ? m.localGoals : 'Sin Jugar'}']: `);
  if (localGoalsInput.trim() !== '') {
    if (localGoalsInput.toLowerCase() === 'null' || localGoalsInput.toLowerCase() === 'x') {
      m.localGoals = null;
    } else {
      const goals = parseInt(localGoalsInput, 10);
      if (!isNaN(goals)) m.localGoals = goals;
    }
  }

  // Ask for goals visitor
  const visitorGoalsInput = await askQuestion(`Goles ${m.visitor} [Dejar vacío para mantener '${m.visitorGoals !== null ? m.visitorGoals : 'Sin Jugar'}']: `);
  if (visitorGoalsInput.trim() !== '') {
    if (visitorGoalsInput.toLowerCase() === 'null' || visitorGoalsInput.toLowerCase() === 'x') {
      m.visitorGoals = null;
    } else {
      const goals = parseInt(visitorGoalsInput, 10);
      if (!isNaN(goals)) m.visitorGoals = goals;
    }
  }

  // For elimination matches, decide the advancing team
  if (m.round !== 'grupos') {
    if (m.localGoals !== null && m.visitorGoals !== null) {
      if (m.localGoals > m.visitorGoals) {
        m.advancingTeam = m.local;
        console.log(`\n➡️  Ganador automático (goles): ${m.local}`);
      } else if (m.visitorGoals > m.localGoals) {
        m.advancingTeam = m.visitor;
        console.log(`\n➡️  Ganador automático (goles): ${m.visitor}`);
      } else {
        // Empate, preguntar quién avanza por penales/reglamento
        console.log(`\nEl partido terminó empatado.`);
        while (true) {
          console.log(`¿Quién clasifica/avanza a la siguiente ronda?`);
          console.log(`1) ${m.local}`);
          console.log(`2) ${m.visitor}`);
          const advChoice = await askQuestion('Seleccione (1 o 2): ');
          if (advChoice === '1') {
            m.advancingTeam = m.local;
            break;
          } else if (advChoice === '2') {
            m.advancingTeam = m.visitor;
            break;
          } else {
            console.log('Opción inválida. Elija 1 o 2.');
          }
        }
      }
    } else {
      m.advancingTeam = null;
    }
  }

  console.log(`\n✅ Partido actualizado con éxito: ${formatMatchLine(m)}`);
  await askQuestion('\nPresione Enter para continuar...');
}

showMainMenu();
