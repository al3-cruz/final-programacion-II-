import { Match, Player, Prediction } from '../types';

/**
 * Standard RFC 4180 CSV parser in TypeScript.
 * Properly handles escaped quotes and newlines within fields.
 */
export function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip next double line endings
      }
      row.push(currentValue.trim());
      lines.push(row);
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  if (currentValue || row.length > 0) {
    row.push(currentValue.trim());
    lines.push(row);
  }
  return lines;
}

/**
 * Parses match data directly from the user's Google Sheets CSV export.
 */
export function parseMatchesCSV(csvText: string): Partial<Match>[] {
  const rows = parseCSV(csvText);
  const parsedMatches: Partial<Match>[] = [];

  for (const row of rows) {
    if (row.length < 5) continue;

    const group = row[0];
    const date = row[1];
    const time = row[2];
    const local = row[3];
    const visitor = row[4];

    // Detect and skip header row
    if (group === 'Grupo' || local === 'Local' || !local || !visitor || local.toLowerCase().startsWith('local')) {
      continue;
    }

    const localGoalsStr = row[5];
    const visitorGoalsStr = row[6];

    let localGoals: number | null = null;
    let visitorGoals: number | null = null;

    if (localGoalsStr !== undefined && localGoalsStr.trim() !== '') {
      const parsed = parseInt(localGoalsStr, 10);
      if (!isNaN(parsed)) localGoals = parsed;
    }

    if (visitorGoalsStr !== undefined && visitorGoalsStr.trim() !== '') {
      const parsed = parseInt(visitorGoalsStr, 10);
      if (!isNaN(parsed)) visitorGoals = parsed;
    }

    parsedMatches.push({
      group,
      date,
      time,
      local,
      visitor,
      localGoals,
      visitorGoals,
    });
  }

  return parsedMatches;
}

/**
 * Sync matches from either our secure backend Service Account API or fallback to CSV export.
 * Defaults to the official sheet ID: 1m9oic9sueHEMgskjnufT0aRhz1KEVYD6IjdKTaR8l3I
 */
export async function syncFromGoogleSheets(
  spreadsheetId: string = '1m9oic9sueHEMgskjnufT0aRhz1KEVYD6IjdKTaR8l3I',
  force: boolean = false
): Promise<{ success: boolean; matches?: Partial<Match>[]; players?: Player[]; cachedAt?: number; error?: string }> {
  try {
    // 1. Attempt secure synchronized backend call
    console.log("Intentando sincronizar mediante el API seguro del backend...");
    const url = `/api/sync?sheetId=${encodeURIComponent(spreadsheetId)}&force=${force ? 'true' : 'false'}`;
    const apiResponse = await fetch(url);
    if (apiResponse.ok) {
      const result = await apiResponse.json();
      if (result.success && result.matches) {
        console.log("Sincronización exitosa desde el Service Account (Backend APIs). Matches y Players cargados.");
        return { 
          success: true, 
          matches: result.matches, 
          players: result.players,
          cachedAt: result.cachedAt
        };
      } else {
        console.warn("Backend API reportó anomalía:", result.error);
      }
    } else {
      console.warn(`Backend API no disponible (status: ${apiResponse.status}). Usando fallback directo de CSV.`);
    }
  } catch (backendError) {
    console.warn("No se pudo conectar al endpoint del backend, intentando enlace fallback directo:", backendError);
  }

  // 2. Resilient Fallback: Direct CSV parser (Google Sheets public web-publication)
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fallback Error HTTP: ${response.status} ${response.statusText}`);
    }
    const csvContent = await response.text();
    const matches = parseMatchesCSV(csvContent);
    return { success: true, matches };
  } catch (error: any) {
    console.error('Ambos métodos de sincronización fallaron:', error);
    return { success: false, error: 'Hubo un error sincronizando el documento: de servicios o de publicación CSV.' };
  }
}
