// Supabase Edge Function: activate-license
// Required server-side secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Deploy with: supabase functions deploy activate-license
// Never expose the service-role key to the client.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Método no permitido." });

  try {
    const { licenseKey, platform, deviceId } = await req.json();
    if (typeof licenseKey !== "string" || licenseKey.trim().length < 12 ||
        !["web", "android", "windows"].includes(platform) ||
        typeof deviceId !== "string" || deviceId.trim().length < 16 || deviceId.length > 256) {
      return json(400, { error: "Faltan datos válidos para activar la licencia." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Faltan secretos de configuración del servidor.");
      return json(500, { error: "El servicio de licencias aún no está configurado." });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const licenseHash = await sha256(licenseKey);
    const deviceHash = await sha256(deviceId);

    const { data: license, error: licenseError } = await admin
      .from("licenses")
      .select("id,status")
      .eq("license_hash", licenseHash)
      .maybeSingle();

    if (licenseError) throw licenseError;
    if (!license || license.status !== "active") {
      return json(403, { valid: false, error: "La licencia no es válida o fue revocada." });
    }

    const { data: existing, error: existingError } = await admin
      .from("license_activations")
      .select("id,device_hash")
      .eq("license_id", license.id)
      .eq("platform", platform)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      if (existing.device_hash !== deviceHash) {
        return json(409, {
          valid: false,
          error: "Esta licencia ya está activada en otro dispositivo de esta plataforma.",
          platform,
        });
      }
      const { error: touchError } = await admin
        .from("license_activations")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (touchError) throw touchError;
      return json(200, { valid: true, platform, message: "Licencia ya activada en este dispositivo." });
    }

    const { error: insertError } = await admin.from("license_activations").insert({
      license_id: license.id,
      platform,
      device_hash: deviceHash,
    });

    if (insertError) {
      // The unique constraint protects against simultaneous activations.
      if (insertError.code === "23505") {
        return json(409, { valid: false, error: "Ya se utilizó la activación de esta plataforma." });
      }
      throw insertError;
    }

    return json(200, { valid: true, platform, message: "Dispositivo activado correctamente." });
  } catch (error) {
    console.error("Error interno al validar licencia:", error);
    return json(500, { error: "No se pudo comprobar la licencia. Intentá nuevamente." });
  }
});
