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

    // IP-Adresse extrahieren
    const ipAddress = getRequestIP(event) || "0.0.0.0";

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
