import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TRIPO_API = 'https://api.tripo3d.ai/v2/openapi';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let task_id;
    try {
      const body = await req.json();
      task_id = body.task_id;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!task_id) {
      return new Response(JSON.stringify({ error: 'task_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('TRIPO_API_KEY');
    if (!apiKey) {
      console.log('API key missing, returning processing status for demo');
      return new Response(JSON.stringify({
        status: 'processing',
        progress: 50,
        demo: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let res;
    try {
      res = await fetch(`${TRIPO_API}/task/${task_id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to connect to Tripo API' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Tripo API error:', res.status, errorText);
      return new Response(JSON.stringify({ error: `Tripo API error: ${res.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    console.log('Check task result:', JSON.stringify(data));

    const status = data.data?.status;

    if (status === 'success') {
      const modelUrl = data.data?.output?.model
        || data.data?.output?.pbr_model
        || data.data?.output?.base_model;

      if (modelUrl) {
        return new Response(JSON.stringify({
          status: 'success',
          model_url: modelUrl,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        status: 'success',
        model_url: null,
        error: 'No model URL in output',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (status === 'failed') {
      return new Response(JSON.stringify({
        status: 'failed',
        error: data.data?.message || 'Task failed',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Still processing
    return new Response(JSON.stringify({
      status: 'processing',
      progress: data.data?.progress || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
