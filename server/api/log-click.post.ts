import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Supabase-Client initialisieren
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[API] POST /api/log-click: Supabase-Konfiguration fehlt");
    throw createError({
      statusCode: 500,
      statusMessage:
        "Server-Konfigurationsfehler: Supabase-Konfiguration fehlt",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Daten aus der Anfrage lesen
    const body = await readBody(event);
    const buttonText = body.buttonText || "Unbekannt";

    // IP-Adresse extrahieren - speziell für Netlify optimiert
    const headers = getHeaders(event);

    // Debug-Ausgabe aller verfügbaren Header
    console.log(
      "[API] POST /api/log-click: Verfügbare Header:",
      Object.keys(headers).filter(
        (key) => key.includes("ip") || key.includes("forward")
      )
    );

    // Netlify-spezifische Header haben Vorrang
    const ipAddress =
      headers["x-nf-client-connection-ip"] || // Netlify-spezifisch
      headers["client-ip"] || // Netlify-spezifisch
      headers["x-forwarded-for"]?.split(",")[0]?.trim() || // Standard-Proxy-Header
      headers["cf-connecting-ip"] || // Cloudflare
      headers["true-client-ip"] || // Akamai und Cloudflare
      headers["x-real-ip"] || // Nginx
      getRequestIP(event) ||
      "Unbekannt";

    console.log(
      `[API] POST /api/log-click: Speichere Klick für "${buttonText}" von IP ${ipAddress}`
    );

    // Klick in Supabase speichern
    const { data, error } = await supabase
      .from("button_clicks")
      .insert([
        {
          buttonText: buttonText,
          ipAdress: ipAddress,
          timestamp: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("[API] POST /api/log-click: Supabase-Fehler:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Fehler beim Speichern des Klicks: ${error.message}`,
      });
    }

    console.log(`[API] POST /api/log-click: Klick erfolgreich gespeichert`);
    return { success: true, data };
  } catch (error: any) {
    console.error("[API] POST /api/log-click: Fehler:", error);

    throw createError({
      statusCode: 500,
      statusMessage:
        error.message || "Unbekannter Fehler beim Verarbeiten des Klicks",
    });
  }
});
