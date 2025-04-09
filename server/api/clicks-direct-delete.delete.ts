import { createClient } from "@supabase/supabase-js";

// Konfiguration für Supabase von Umgebungsvariablen
const supabaseUrl = process.env.SUPABASE_URL || ""; // URL aus den Umgebungsvariablen
const supabaseKey = process.env.SUPABASE_KEY || ""; // Anon/Service-Key aus den Umgebungsvariablen

// Supabase Client erstellen
const supabase = createClient(supabaseUrl, supabaseKey);

export default defineEventHandler(async (event) => {
  console.log(
    "API DELETE /api/clicks-direct-delete: Löschvorgang mit direktem Supabase-Zugriff"
  );

  try {
    // Direkte Löschoperation an Supabase (ohne Prisma)
    const { error, count } = await supabase
      .from("ButtonClick")
      .delete({ count: "exact" });

    if (error) {
      console.error(
        "API DELETE /api/clicks-direct-delete: Supabase-Fehler:",
        error
      );
      throw createError({
        statusCode: 500,
        statusMessage: `Datenbankfehler: ${error.message}`,
      });
    }

    console.log(
      `API DELETE /api/clicks-direct-delete: ${count || 0} Einträge gelöscht`
    );
    return { success: true, count: count || 0 };
  } catch (error: unknown) {
    console.error("API DELETE /api/clicks-direct-delete: Fehler:", {
      message: (error as Error)?.message || "Unbekannter Fehler",
    });

    throw createError({
      statusCode: 500,
      statusMessage: `Fehler beim Löschen der Klicks: ${
        (error as Error)?.message || "Unbekannter Fehler"
      }`,
    });
  }
});
