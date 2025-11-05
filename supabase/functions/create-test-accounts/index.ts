import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get Pro plan ID
    const { data: plans } = await supabaseAdmin
      .from('subscription_plans')
      .select('id')
      .eq('name', 'Pro')
      .single()

    if (!plans) {
      throw new Error('Pro plan not found')
    }

    const proPlanId = plans.id

    // Create admin user
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        display_name: 'Admin Test',
      },
    })

    if (adminError) {
      console.error('Error creating admin:', adminError)
    } else if (adminUser.user) {
      // Assign admin role
      await supabaseAdmin.from('user_roles').insert({
        user_id: adminUser.user.id,
        role: 'admin',
      })

      // Create subscription
      await supabaseAdmin.from('user_subscriptions').insert({
        user_id: adminUser.user.id,
        plan_id: proPlanId,
        status: 'active',
      })
    }

    // Create regular user
    const { data: regularUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: 'user@test.com',
      password: 'User123!',
      email_confirm: true,
      user_metadata: {
        display_name: 'User Test',
      },
    })

    if (userError) {
      console.error('Error creating user:', userError)
    } else if (regularUser.user) {
      // Regular users get 'user' role automatically via trigger
      // Create subscription
      await supabaseAdmin.from('user_subscriptions').insert({
        user_id: regularUser.user.id,
        plan_id: proPlanId,
        status: 'active',
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comptes de test créés avec succès',
        admin: {
          email: 'admin@test.com',
          password: 'Admin123!',
          id: adminUser?.user?.id,
        },
        user: {
          email: 'user@test.com',
          password: 'User123!',
          id: regularUser?.user?.id,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
