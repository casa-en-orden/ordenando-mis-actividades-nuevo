// Genera una licencia de venta desde Google Apps Script.
// Secrets requeridos en Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// SALES_ADMIN_TOKEN (token aleatorio compartido con las propiedades del script).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sales-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value.trim()));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function makeLicense(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `OMA-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Método no permitido." });

  try {
    const expectedToken = Deno.env.get("SALES_ADMIN_TOKEN");
    const suppliedToken = req.headers.get("x-sales-token") || "";
    if (!expectedToken || suppliedToken.length !== expectedToken.length || suppliedToken !== expectedToken) {
      return json(401, { error: "No autorizado." });
    }

    const { buyerName, buyerEmail } = await req.json();
    if (typeof buyerName !== "string" || !buyerName.trim() ||
        typeof buyerEmail !== "string" || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(buyerEmail.trim())) {
      return json(400, { error: "Nombre o correo inválido." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json(500, { error: "Servicio no configurado." });

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Retry on the extremely unlikely event of a hash collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      const licenseKey = makeLicense();
      const licenseHash = await sha256(licenseKey);
      const { error } = await admin.from("licenses").insert({
        license_hash: licenseHash,
        status: "active",
        buyer_reference: buyerEmail.trim(),
        notes: `Venta: ${buyerName.trim()}`,
      });
      if (!error) return json(200, { success: true, licenseKey });
      if (error.code !== "23505") {
        console.error("No se pudo crear la licencia:", error);
        return json(500, { error: "No se pudo crear la licencia." });
      }
    }
    return json(500, { error: "No se pudo generar un código único. Intentá nuevamente." });
  } catch (error) {
    console.error("Error al generar licencia:", error);
    return json(500, { error: "Solicitud inválida o error interno." });
  }
});
