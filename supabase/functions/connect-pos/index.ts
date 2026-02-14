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
    // Credenciales públicas de demo - no son secretas
    const formData = new FormData()
    formData.append("username", "demo")
    formData.append("password", "demo")
    formData.append("store", "demo")
    formData.append("remember_user", "1")

    const response = await fetch("https://softwarepos.online/index.php/login/index/1", {
      method: "POST",
      body: formData,
      redirect: "manual",
    })

    const setCookie = response.headers.get('set-cookie')

    return new Response(
      JSON.stringify({
        message: "Demo lista",
        session: setCookie,
        redirect_url: "https://softwarepos.online/index.php/login/index/1",
      }),
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
