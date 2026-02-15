import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { username, password, store, consent } = await req.json()

    if (!username || !password || !store) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos requeridos: username, password, store" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    // Validate credentials against external POS
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)
    formData.append("store", store)
    formData.append("remember_user", "1")

    const posResponse = await fetch("https://softwarepos.online/index.php/login/index/1", {
      method: "POST",
      body: formData,
      redirect: "manual",
    })

    // A successful login typically returns a 302 redirect with a session cookie
    const setCookie = posResponse.headers.get('set-cookie')
    const isSuccess = (posResponse.status === 302 || posResponse.status === 200) && !!setCookie

    // If login was successful and user consented, store credentials
    if (isSuccess && consent) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, serviceKey)

        // Get user from token
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)

        if (user) {
          await supabase.rpc('upsert_client_pos_session', {
            _user_id: user.id,
            _pos_username: username,
            _pos_store: store,
            _pos_password: password,
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message: isSuccess ? "Acceso verificado correctamente" : "Credenciales no válidas o servicio no disponible",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
