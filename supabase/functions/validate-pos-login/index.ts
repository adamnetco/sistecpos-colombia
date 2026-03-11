import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)
    formData.append("store", store)
    formData.append("remember_user", "1")

    const posResponse = await fetch("https://softwarepos.online/index.php/login/index/1", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      redirect: "manual",
    })

    const status = posResponse.status
    const setCookie = posResponse.headers.get('set-cookie')
    const location = posResponse.headers.get('location')

    console.log(`POS login attempt: status=${status}, hasCookie=${!!setCookie}, location=${location}`)

    // Success indicators: redirect (302/301) to dashboard, or 200 with session cookie
    // A failed login typically returns 200 with login form again (no redirect)
    const isRedirect = status >= 300 && status < 400
    const hasSessionCookie = !!setCookie && (setCookie.includes('ci_session') || setCookie.includes('PHPSESSID') || setCookie.length > 50)
    const isSuccess = isRedirect || hasSessionCookie

    // If login was successful and user consented, store credentials
    if (isSuccess && consent) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, serviceKey)

        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)

        if (user) {
          await supabase.rpc('upsert_client_pos_session', {
            _user_id: user.id,
            _pos_username: username,
            _pos_store: store,
            _pos_password: password,
          })
          console.log(`Credentials stored for user ${user.id}`)
        }
      }
    }

    // If consent given but validation uncertain, still store (trust user input)
    if (!isSuccess && consent) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, serviceKey)

        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)

        if (user) {
          // Store anyway since the user explicitly consented - the POS server
          // may behave differently when called from edge vs browser
          await supabase.rpc('upsert_client_pos_session', {
            _user_id: user.id,
            _pos_username: username,
            _pos_store: store,
            _pos_password: password,
          })
          console.log(`Credentials stored (unverified) for user ${user.id}`)
          
          return new Response(
            JSON.stringify({
              success: true,
              message: "Credenciales almacenadas. Se abrirá tu POS.",
              stored: true,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          )
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message: isSuccess ? "Acceso verificado correctamente" : "No se pudo verificar, pero se abrirá el POS.",
        stored: isSuccess && consent,
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
