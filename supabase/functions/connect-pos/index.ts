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
    let username = "demo"
    let password = "demo"
    let store = "demo"

    // Accept custom credentials from POST body
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        if (body.username) username = body.username
        if (body.password) password = body.password
        if (body.store) store = body.store
      } catch {
        // If no JSON body, use demo credentials
      }
    }

    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)
    formData.append("store", store)
    formData.append("remember_user", "1")

    const response = await fetch("https://softwarepos.online/index.php/login/index/1", {
      method: "POST",
      body: formData,
      redirect: "manual",
    })

    const setCookie = response.headers.get('set-cookie')

    return new Response(
      JSON.stringify({
        message: username === "demo" ? "Demo lista" : "Sesión iniciada",
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
