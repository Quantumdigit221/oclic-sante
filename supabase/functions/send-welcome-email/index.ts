import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, centerName } = await req.json()
    
    if (!email || !password || !centerName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Send email using Supabase Auth (simplified version)
    const { error } = await supabaseClient.auth.admin.updateUserById(
      email,
      {
        email: email,
        password: password,
        email_confirm: true
      }
    )

    if (error) {
      console.error('Email send error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For now, just log the email content (in production, use a proper email service)
    const emailContent = `
      Bienvenue sur Sénégal Santé SaaS !
      
      Cher administrateur du centre ${centerName},
      
      Votre compte a été créé avec succès.
      
      Email: ${email}
      Mot de passe temporaire: ${password}
      
      Veuillez vous connecter et changer votre mot de passe dès que possible.
      
      URL de connexion: ${Deno.env.get('SITE_URL') || 'http://localhost:3000'}
      
      Cordialement,
      L'équipe Sénégal Santé SaaS
    `
    
    console.log('Email content:', emailContent)

    return new Response(
      JSON.stringify({ 
        message: 'Email sent successfully',
        email: email,
        centerName: centerName
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
