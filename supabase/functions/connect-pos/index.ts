import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const POS_USER = Deno.env.get('POS_USER')
    const POS_PASS = Deno.env.get('POS_PASS')
    const POS_STORE = Deno.env.get('POS_STORE')

    if (!POS_USER || !POS_PASS || !POS_STORE) {
      return new Response(
        JSON.stringify({ error: "Credenciales POS no configuradas" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    const formData = new FormData()
    formData.append("username", POS_USER)
    formData.append("password", POS_PASS)
    formData.append("store", POS_STORE)
    formData.append("remember_user", "1")

    const response = await fetch("https://softwarepos.online/index.php/login", {
      method: "POST",
      body: formData,
    })

    const setCookie = response.headers.get('set-cookie')

    return new Response(
      JSON.stringify({ message: "Conectado al POS exitosamente", session: setCookie }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
