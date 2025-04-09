import { createClient } from "@supabase/supabase-js";
import { defineEventHandler, createError } from "h3";

export default defineEventHandler(async (event) => {
  // Supabase Konfiguration aus Umgebungsvariablen
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase Konfiguration fehlt. SUPABASE_URL und SUPABASE_ANON_KEY müssen gesetzt sein."
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Server Konfigurationsfehler",
    });
  }

  // Supabase Client initialisieren
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Klicks aus Supabase abrufen
    const { data, error } = await supabase
      .from("button_clicks")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Fehler beim Abrufen der Klicks aus Supabase:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Fehler beim Abrufen der Klicks",
      });
    }

    return data || [];
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Klicks-Anfrage:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Interner Serverfehler",
    });
  }
});
