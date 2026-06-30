import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { DEFAULT_GROUP_MATCHES, ALL_DEFAULT_MATCHES } from "./src/data/defaultMatches";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple in-memory cache for sheets API to prevent token depletion and rate-limiting
  let cachedSyncData: any = null;
  let cachedAt: number = 0;
  const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache lifetime is extremely responsive and saves up to 99% of requests!

  // New endpoint to quickly check the current sheet cache version/timestamp
  app.get("/api/sheet-version", (req, res) => {
    return res.json({
      success: true,
      cachedAt: cachedAt,
      ttl: CACHE_TTL
    });
  });

  // 1. Google Sheets Secure Service Account Proxy API
  app.get("/api/sync", async (req, res) => {
    try {
      const forceQuery = req.query.force === "true";
      const now = Date.now();

      if (!forceQuery && cachedSyncData && (now - cachedAt < CACHE_TTL)) {
        console.log(`[Cache Hit] Sirviendo datos de Google Sheets desde caché en memoria (${Math.round((now - cachedAt) / 1000)}s de antigüedad)`);
        return res.json({
          success: true,
          matches: cachedSyncData.matches,
          players: cachedSyncData.players,
          cachedAt: cachedAt
        });
      }

      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const sheetId = process.env.GOOGLE_SHEET_ID || "1m9oic9sueHEMgskjnufT0aRhz1KEVYD6IjdKTaR8l3I";

      if (!email || !privateKey) {
        console.warn("Backend Sheet Sync warning: Missing service account credentials in environment.");
        return res.status(500).json({
          success: false,
          error: "Las credenciales del Service Account de Google no están configuradas en el servidor."
        });
      }

      // Format private key properly for multi-line PEM format
      let cleanKey = privateKey.trim();
      
      // Strip outer quotes if present
      if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
        cleanKey = cleanKey.slice(1, -1).trim();
      } else if (cleanKey.startsWith("'") && cleanKey.endsWith("'")) {
        cleanKey = cleanKey.slice(1, -1).trim();
      }

      // Convert literal "\n" strings into actual newline characters
      let formattedPrivateKey = cleanKey.replace(/\\n/g, "\n");

      // Replace multiple concurrent newlines with single ones
      formattedPrivateKey = formattedPrivateKey.replace(/\n+/g, "\n").trim();

      // Ensure the key headers are correct and fully isolated
      if (!formattedPrivateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
        const startIndex = formattedPrivateKey.indexOf("-----BEGIN PRIVATE KEY-----");
        if (startIndex !== -1) {
          formattedPrivateKey = formattedPrivateKey.substring(startIndex);
        } else {
          formattedPrivateKey = "-----BEGIN PRIVATE KEY-----\n" + formattedPrivateKey;
        }
      }

      if (!formattedPrivateKey.endsWith("-----END PRIVATE KEY-----")) {
        const endIndex = formattedPrivateKey.indexOf("-----END PRIVATE KEY-----");
        if (endIndex !== -1) {
          formattedPrivateKey = formattedPrivateKey.substring(0, endIndex + "-----END PRIVATE KEY-----".length);
        } else {
          formattedPrivateKey = formattedPrivateKey + "\n-----END PRIVATE KEY-----";
        }
      }

      // Add the final trailing newline required by PEM standard
      formattedPrivateKey = formattedPrivateKey + "\n";

      // Initialize the JWT auth client
      const auth = new google.auth.JWT({
        email,
        key: formattedPrivateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
      });

      const sheets = google.sheets({ version: "v4", auth });

      // Retrieve cell values from the tables
      const [responsePartidos, responsePredicciones, responsePuntuaciones, responsePrediccionesElim] = await Promise.all([
        sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: "'Partidos Fase de grupos'!A1:H80"
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: "'Predicciones Fase De Grupos'!A1:AZ80"
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: "'Puntuaciones'!A1:H40"
        }),
        sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: "'Predicciones Eliminatorias'!A1:AZ80"
        })
      ]);

      // 1. Parse "Puntuaciones" for Envio order & status
      const puntuacionesRows = responsePuntuaciones.data.values || [];
      const envioMap: Record<string, number> = {};
      const eliminatedPlayerNames = new Set<string>();

      // Read players send order from first block
      for (let i = 1; i < puntuacionesRows.length; i++) {
        const row = puntuacionesRows[i];
        if (!row || row.length === 0 || !row[0] || row[0].trim() === "") {
          break; // split row
        }
        const name = row[0].trim();
        const envioValStr = row[4];
        let envioVal = 10;
        if (envioValStr !== undefined && String(envioValStr).trim() !== "") {
          const parsed = parseInt(String(envioValStr).trim(), 10);
          if (!isNaN(parsed)) envioVal = parsed;
        }
        envioMap[name] = envioVal;
      }

      // Read Leaderboard for "Eliminado/a" status
      let foundLeaderboard = false;
      for (let i = 0; i < puntuacionesRows.length; i++) {
        const row = puntuacionesRows[i];
        if (!row || row.length === 0) continue;
        if (row[0] === "Orden" && row[1] === "Nombre") {
          foundLeaderboard = true;
          continue;
        }
        if (foundLeaderboard) {
          const name = row[1];
          const status = row[7]; // last column, might contain "Eliminado/a"
          if (name && status) {
            const rawStatus = String(status).trim().toLowerCase();
            if (rawStatus === "eliminado" || rawStatus === "eliminado/a" || (rawStatus.includes("eliminado") && !rawStatus.includes("no"))) {
              eliminatedPlayerNames.add(name.trim());
            }
          }
        }
      }

      // 2. Initialize our default matches map
      const finalMatchesMap: Record<string, any> = {};
      ALL_DEFAULT_MATCHES.forEach(m => {
        finalMatchesMap[m.id] = { ...m };
      });

      // 3. Helper normalizers & match indexers
      const normalizeTeam = (name: string): string => {
        if (!name) return "";
        return name.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // remove accents
          .replace(/[^a-z0-9]/g, "")      // keep only alphanumeric
          .trim();
      };

      const findMatchId = (matchNumStr: string, localTeam: string, visitorTeam: string): string | null => {
        const num = parseInt(matchNumStr, 10);
        if (!isNaN(num) && num >= 73 && num <= 88) {
          // Direct map for dieciseisavos based on match number in the sheet
          const matchNumToTemplateId: Record<number, string> = {
            73: '16avos-3', // Alemania - Paraguay
            74: '16avos-6', // Francia - Suecia
            75: '16avos-1', // Sudáfrica - Canadá
            76: '16avos-4', // Países Bajos - Marruecos
            77: '16avos-12', // Portugal - Croacia
            78: '16avos-11', // España - Austria (template opponent '2J')
            79: '16avos-10', // Estados Unidos - BiH (sheet 'Bosnia')
            80: '16avos-9', // Bélgica - Senegal
            81: '16avos-2', // Brasil - Japón
            82: '16avos-5', // Costa de Marfil - Noruega
            83: '16avos-7', // México - Ecuador
            84: '16avos-8', // Inglaterra - RD Congo
            85: '16avos-15', // Argentina - Cabo Verde
            86: '16avos-14', // Australia - Egipto
            87: '16avos-13', // Suiza - Argelia (template opponent '3E...')
            88: '16avos-16'  // Colombia - Ghana
          };
          return matchNumToTemplateId[num] || null;
        }

        const normLocal = normalizeTeam(localTeam);
        const normVisitor = normalizeTeam(visitorTeam);

        const match = DEFAULT_GROUP_MATCHES.find(m => {
          const mLocal = normalizeTeam(m.local);
          const mVisitor = normalizeTeam(m.visitor);
          return (mLocal === normLocal && mVisitor === normVisitor) ||
                 (mLocal === normVisitor && mVisitor === normLocal);
        });
        return match ? match.id : null;
      };

      // 4. Parse "Partidos Fase de grupos" matches & update map
      const partidosRows = responsePartidos.data.values || [];
      for (let i = 2; i < partidosRows.length; i++) {
        const row = partidosRows[i];
        if (!row || row.length < 5) continue;

        const local = row[3];
        const visitor = row[4];
        if (!local || !visitor || local.toLowerCase().startsWith("local")) {
          continue;
        }

        const matchId = findMatchId("", local, visitor);
        if (matchId && finalMatchesMap[matchId]) {
          const localGoalsStr = row[5];
          const visitorGoalsStr = row[6];

          let localGoals: number | null = null;
          let visitorGoals: number | null = null;

          if (localGoalsStr !== undefined && String(localGoalsStr).trim() !== "") {
            const parsed = parseInt(String(localGoalsStr).trim(), 10);
            if (!isNaN(parsed)) localGoals = parsed;
          }

          if (visitorGoalsStr !== undefined && String(visitorGoalsStr).trim() !== "") {
            const parsed = parseInt(String(visitorGoalsStr).trim(), 10);
            if (!isNaN(parsed)) visitorGoals = parsed;
          }

          finalMatchesMap[matchId].localGoals = localGoals;
          finalMatchesMap[matchId].visitorGoals = visitorGoals;
        }
      }

      // 5. Parse "Predicciones Eliminatorias" matches & update map (incorporating real teams & results)
      const elimPrediccionesRows = responsePrediccionesElim.data.values || [];
      for (let i = 2; i < elimPrediccionesRows.length; i++) {
        const row = elimPrediccionesRows[i];
        if (!row || row.length < 5) continue;

        const matchNumStr = row[0];
        const local = row[3];
        const visitor = row[4];
        if (!local || !visitor) continue;

        const matchId = findMatchId(matchNumStr, local, visitor);
        if (matchId && finalMatchesMap[matchId]) {
          const localGoalsStr = row[5];
          const visitorGoalsStr = row[6];
          const advancingTeamStr = row[7];

          let localGoals: number | null = null;
          let visitorGoals: number | null = null;

          if (localGoalsStr !== undefined && String(localGoalsStr).trim() !== "") {
            const parsed = parseInt(String(localGoalsStr).trim(), 10);
            if (!isNaN(parsed)) localGoals = parsed;
          }

          if (visitorGoalsStr !== undefined && String(visitorGoalsStr).trim() !== "") {
            const parsed = parseInt(String(visitorGoalsStr).trim(), 10);
            if (!isNaN(parsed)) visitorGoals = parsed;
          }

          finalMatchesMap[matchId].local = local.trim();
          finalMatchesMap[matchId].visitor = visitor.trim();
          finalMatchesMap[matchId].localGoals = localGoals;
          finalMatchesMap[matchId].visitorGoals = visitorGoals;
          finalMatchesMap[matchId].advancingTeam = advancingTeamStr ? advancingTeamStr.trim() : null;
        }
      }

      const parsedMatches = Object.values(finalMatchesMap);

      // Helper to find a player's columns by name in both predictions sheets
      const findGroupCols = (name: string) => {
        const groupRow0 = responsePredicciones.data.values?.[0] || [];
        const normName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
        for (let c = 5; c < groupRow0.length; c += 2) {
          const val = groupRow0[c];
          if (val) {
            const normVal = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
            if (normVal === normName) {
              return { localCol: c, visitorCol: c + 1 };
            }
          }
        }
        return null;
      };

      const findElimCols = (name: string) => {
        const elimRow0 = responsePrediccionesElim.data.values?.[0] || [];
        const normName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
        for (let c = 8; c < elimRow0.length; c += 3) {
          const val = elimRow0[c];
          if (val) {
            const normVal = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
            if (normVal === normName) {
              return { localCol: c, visitorCol: c + 1, avanzaCol: c + 2 };
            }
          }
        }
        return null;
      };

      // 6. Assemble list of compiled players & predictions
      const allPlayerNames: string[] = [];
      for (let i = 1; i <= 11; i++) {
        const row = puntuacionesRows[i];
        if (row && row[0] && row[0].trim() !== "") {
          allPlayerNames.push(row[0].trim());
        }
      }
      if (allPlayerNames.length === 0) {
        // Fallback: collect from group stage sheet first row
        const gr0 = responsePredicciones.data.values?.[0] || [];
        for (let c = 5; c < gr0.length; c += 2) {
          if (gr0[c] && gr0[c].trim() !== "") allPlayerNames.push(gr0[c].trim());
        }
      }

      // Generate Delivery/Submission timestamps helper
      const generateSubmissionTimesForPlayer = (order: number) => {
        const baseOffsetMinutes = order * 15;
        const baseTimeStr = (offsetMin: number, baseDateIso: string) => {
          const baseMillis = new Date(baseDateIso).getTime();
          return new Date(baseMillis + offsetMin * 60 * 1000).toISOString();
        };

        return {
          grupos: baseTimeStr(baseOffsetMinutes, "2026-06-11T12:00:00-04:00"),
          dieciseisavos: baseTimeStr(baseOffsetMinutes, "2026-06-28T12:00:00-04:00"),
          octavos: baseTimeStr(baseOffsetMinutes, "2026-07-04T12:00:00-04:00"),
          cuartos: baseTimeStr(baseOffsetMinutes, "2026-07-09T12:00:00-04:00"),
          semifinales: baseTimeStr(baseOffsetMinutes, "2026-07-14T12:00:00-04:00"),
          tercer_puesto: baseTimeStr(baseOffsetMinutes, "2026-07-18T12:00:00-04:00"),
          final: baseTimeStr(baseOffsetMinutes, "2026-07-19T12:00:00-04:00"),
        };
      };

      const compiledPlayers = allPlayerNames.map((playerName, idx) => {
        const playerId = `pl-${idx + 1}`;
        const predictions: Record<string, any> = {};

        // A. Load Group Stage Predictions
        const groupCols = findGroupCols(playerName);
        if (groupCols) {
          const groupPredRows = responsePredicciones.data.values || [];
          for (let i = 2; i < groupPredRows.length; i++) {
            const row = groupPredRows[i];
            if (!row || row.length < 5) continue;

            const rowLocal = row[3];
            const rowVisitor = row[4];
            if (!rowLocal || !rowVisitor) continue;

            const matchId = findMatchId("", rowLocal, rowVisitor);
            if (matchId) {
              const predLocalStr = row[groupCols.localCol];
              const predVisitorStr = row[groupCols.visitorCol];

              if (
                predLocalStr !== undefined && String(predLocalStr).trim() !== "" &&
                predVisitorStr !== undefined && String(predVisitorStr).trim() !== ""
              ) {
                const lG = parseInt(String(predLocalStr).trim(), 10);
                const vG = parseInt(String(predVisitorStr).trim(), 10);

                if (!isNaN(lG) && !isNaN(vG)) {
                  predictions[matchId] = {
                    matchId,
                    localGoals: lG,
                    visitorGoals: vG
                  };
                }
              }
            }
          }
        }

        // B. Load Elimination Stage Predictions
        const elimCols = findElimCols(playerName);
        if (elimCols) {
          const elimPredRows = responsePrediccionesElim.data.values || [];
          for (let i = 2; i < elimPredRows.length; i++) {
            const row = elimPredRows[i];
            if (!row || row.length < 5) continue;

            const rowLocal = row[3];
            const rowVisitor = row[4];
            if (!rowLocal || !rowVisitor) continue;

            const matchId = findMatchId(row[0], rowLocal, rowVisitor);
            if (matchId) {
              const predLocalStr = row[elimCols.localCol];
              const predVisitorStr = row[elimCols.visitorCol];
              const predAvanzaStr = row[elimCols.avanzaCol];

              if (
                predLocalStr !== undefined && String(predLocalStr).trim() !== "" &&
                predVisitorStr !== undefined && String(predVisitorStr).trim() !== ""
              ) {
                const lG = parseInt(String(predLocalStr).trim(), 10);
                const vG = parseInt(String(predVisitorStr).trim(), 10);

                if (!isNaN(lG) && !isNaN(vG)) {
                  predictions[matchId] = {
                    matchId,
                    localGoals: lG,
                    visitorGoals: vG,
                    advancingTeam: predAvanzaStr ? predAvanzaStr.trim() : null
                  };
                }
              }
            }
          }
        }

        const order = envioMap[playerName] || 10;
        const isEliminated = eliminatedPlayerNames.has(playerName);

        return {
          id: playerId,
          name: playerName,
          predictions,
          deliveryTimeByRound: generateSubmissionTimesForPlayer(order),
          isEliminated,
          eliminatedInRound: isEliminated ? "grupos" : undefined
        };
      });

      // Save to cache
      cachedSyncData = {
        matches: parsedMatches,
        players: compiledPlayers
      };
      cachedAt = Date.now();

      console.log(`Backend Sync: Sincronizados con éxito ${parsedMatches.length} partidos y ${compiledPlayers.length} jugadores.`);
      return res.json({
        success: true,
        matches: parsedMatches,
        players: compiledPlayers,
        cachedAt: cachedAt
      });

    } catch (error: any) {
      console.error("Error en sincronización de Google Sheets backend:", error);
      return res.status(500).json({
        success: false,
        error: error.message || String(error)
      });
    }
  });

  // Simple connection pooling for SSE clients
  let sseClients: { id: number; res: any }[] = [];

  // 2. Real-time notifications SSE Endpoint
  app.get("/api/events", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);
    console.log(`[SSE] Nuevo usuario conectado para notificaciones push en tiempo real. ID: ${clientId}. Activos: ${sseClients.length}`);

    // Send initial handshake success response
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conexión de eventos en tiempo real establecida.' })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
      console.log(`[SSE] Usuario ID ${clientId} desconectado. Conectados restantes: ${sseClients.length}`);
    });
  });

  // 3. Webhook endpoint to notify updates from Google Sheet Apps Script
  app.all("/api/sheet-updated", (req, res) => {
    console.log("[Webhook] ¡Notificación recibida desde Google Sheets! Limpiando caché en memoria y notificando clientes en tiempo real...");
    
    // Invalidate express-side Sheets cache immediately
    cachedSyncData = null;
    cachedAt = 0;

    // Broadcast the update event to all active browsers via SSE
    const payload = JSON.stringify({
      type: "sheet-updated",
      timestamp: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: "La tabla de posiciones y resultados se ha actualizado con nuevos datos desde Google Sheets."
    });

    let successfullyNotified = 0;
    sseClients.forEach(client => {
      try {
        client.res.write(`data: ${payload}\n\n`);
        successfullyNotified++;
      } catch (err) {
        console.error(`[SSE] Error enviando actualización al cliente ${client.id}:`, err);
      }
    });

    console.log(`[Webhook] Difusión realizada con éxito a ${successfullyNotified} de ${sseClients.length} usuarios activos.`);

    return res.json({
      success: true,
      message: "Notificación push enviada en tiempo real.",
      clientsNotified: successfullyNotified,
      totalConnected: sseClients.length
    });
  });

  // Live health-checking API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Direct Service Worker route for absolute reliability across environments
  app.get("/sw.js", (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`// Service Worker de Notificaciones de Copa Extra 2026
self.addEventListener('install', (e) => {
  console.log('[Copa Extra SW] Service Worker instalado con éxito.');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Copa Extra SW] Service Worker activado.');
  e.waitUntil(self.clients.claim());
});

// Escuchador de eventos de notificaciones push en segundo plano / mensaje de la pestaña
self.addEventListener('message', (event) => {
  console.log('[Copa Extra SW] Mensaje recibido en SW:', event.data);
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    
    event.waitUntil(
      self.registration.showNotification(title || 'Copa Extra 2026', {
        body: body || '¡Resultados de Google Sheets actualizados!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        tag: tag || 'sheet-update-notification',
        renotify: true,
        data: { url: self.location.origin }
      })
    );
  }
});

// Manejo de clic en la notificación nativa
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});`);
  });

  // 2. Vite Integration Middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando Vite en modo desarrollo como middleware de Express...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando modo producción con carpeta estática dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack Server] Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
