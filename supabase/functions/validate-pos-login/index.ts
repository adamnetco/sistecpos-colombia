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

    const posResponse = await fetch("https://sistecpos.online", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      redirect: "manual",
    })

    const status = posResponse.status
    const location = posResponse.headers.get('location')

    // Read body to check for error messages (failed login shows error text in HTML)
    let bodyText = ""
    try {
      bodyText = await posResponse.text()
    } catch {
      // ignore read errors
    }

    console.log(`POS login attempt: status=${status}, location=${location}, bodyLen=${bodyText.length}`)

    // Success: redirect (302/301) to a non-login page
    // Failure: 200 with login form containing error text, OR redirect back to login page
    const isRedirect = status >= 300 && status < 400
    const redirectsToLogin = location?.includes('/login') ?? false
    const bodyHasError = bodyText.toLowerCase().includes('inválido') || 
                         bodyText.toLowerCase().includes('invalido') ||
                         bodyText.toLowerCase().includes('error') ||
                         bodyText.toLowerCase().includes('incorrect')
    
    // Only consider it a success if:
    // 1. It's a redirect that does NOT go back to the login page, OR
    // 2. The response body does NOT contain error indicators
    const isSuccess = isRedirect && !redirectsToLogin && !bodyHasError

    console.log(`POS validation: isRedirect=${isRedirect}, redirectsToLogin=${redirectsToLogin}, bodyHasError=${bodyHasError}, isSuccess=${isSuccess}`)

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

    // If consent given but validation failed, still store (trust user input)
    if (!isSuccess && consent) {
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
        message: isSuccess 
          ? "Acceso verificado correctamente" 
          : "Credenciales incorrectas. Verifica usuario, tienda y clave.",
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
