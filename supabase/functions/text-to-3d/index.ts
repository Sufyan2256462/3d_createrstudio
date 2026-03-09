import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DEMO_MODELS = [
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoxAnimated/glTF-Binary/BoxAnimated.glb',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BrainStem/glTF-Binary/BrainStem.glb',
];

const TRIPO_API = 'https://api.tripo3d.ai/v2/openapi';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let prompt, demo;
    try {
      const body = await req.json();
      prompt = body.prompt;
      demo = body.demo;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('TRIPO_API_KEY');
    if (demo || !apiKey) {
      await new Promise(r => setTimeout(r, 2000));
      const modelUrl = DEMO_MODELS[Math.floor(Math.random() * DEMO_MODELS.length)];
      return new Response(JSON.stringify({
        model_url: modelUrl,
        status: 'success',
        demo: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create task and return task_id immediately
    let res;
    try {
      res = await fetch(`${TRIPO_API}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ type: 'text_to_model', prompt }),
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

    const taskRes = await res.json();
    console.log('Tripo create task response:', JSON.stringify(taskRes));

    if (taskRes.code !== 0) {
      const msg = (taskRes.message || '').toLowerCase();
      if (taskRes.code === 2010 || msg.includes('credit') || msg.includes('balance') || msg.includes('quota')) {
        await new Promise(r => setTimeout(r, 2000));
        const modelUrl = DEMO_MODELS[Math.floor(Math.random() * DEMO_MODELS.length)];
        return new Response(JSON.stringify({
          model_url: modelUrl,
          status: 'success',
          demo: true,
          notice: 'API credits exhausted, showing demo model',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: taskRes.message || 'Failed to create task' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      task_id: taskRes.data?.task_id,
      status: 'processing',
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
