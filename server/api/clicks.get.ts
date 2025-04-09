import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Supabase Konfiguration aus Umgebungsvariablen
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[API] GET /api/clicks: Supabase-Konfiguration fehlt. SUPABASE_URL und SUPABASE_KEY müssen gesetzt sein."
    );
    // Im Produktionsmodus leere Liste zurückgeben statt zu scheitern
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Server-Konfigurationsfehler",
    });
  }

  // Supabase Client initialisieren
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log("[API] GET /api/clicks: Starte Abfrage");

    // Klicks aus Supabase abrufen
    const { data, error } = await supabase
      .from("button_clicks")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("[API] GET /api/clicks: Supabase-Fehler:", error);
      // Im Produktionsmodus leere Liste zurückgeben
      if (process.env.NODE_ENV === "production") {
        return [];
      }
      throw createError({
        statusCode: 500,
        statusMessage: "Fehler beim Abrufen der Klicks",
      });
    }

    console.log(`[API] GET /api/clicks: ${data?.length || 0} Klicks gefunden`);
    return data || [];
  } catch (error) {
    console.error("[API] GET /api/clicks: Fehler:", error);
    // Im Produktionsmodus leere Liste zurückgeben
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    if ((error as any).statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Interner Serverfehler",
    });
  }
});
