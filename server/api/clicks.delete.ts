import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Supabase Konfiguration aus Umgebungsvariablen
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[API] DELETE /api/clicks: Supabase-Konfiguration fehlt");
    throw createError({
      statusCode: 500,
      statusMessage:
        "Server-Konfigurationsfehler: Supabase-Konfiguration fehlt",
    });
  }

  // Supabase Client initialisieren
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log("[API] DELETE /api/clicks: Lösche alle Klicks");

    // Alle Einträge in der Tabelle löschen
    const { error, count } = await supabase
      .from("button_clicks")
      .delete({ count: "exact" })
      .not("button_text", "is", null); // Diese Bedingung ist immer wahr, wird aber von Supabase benötigt

    if (error) {
      console.error("[API] DELETE /api/clicks: Supabase-Fehler:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Fehler beim Löschen der Klicks: ${error.message}`,
      });
    }

    console.log(`[API] DELETE /api/clicks: ${count || 0} Klicks gelöscht`);

    return {
      success: true,
      message: `${count || 0} Klicks wurden gelöscht`,
    };
  } catch (error: unknown) {
    console.error("[API] DELETE /api/clicks: Fehler:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Fehler beim Löschen der Klicks: ${
        (error as Error)?.message || "Unbekannter Fehler"
      }`,
    });
  }
});
