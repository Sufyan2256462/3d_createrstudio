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

async function uploadImage(apiKey: string, imageBase64: string): Promise<string> {
  const binaryStr = atob(imageBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const formData = new FormData();
  formData.append('file', new Blob([bytes], { type: 'image/png' }), 'image.png');

  const res = await fetch(`${TRIPO_API}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message || 'Upload failed');
  return data.data?.image_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let image, demo;
    try {
      const body = await req.json();
      image = body.image;
      demo = body.demo;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('TRIPO_API_KEY');

    // Demo mode
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

    // Upload image and create task - return task_id immediately
    const imageToken = await uploadImage(apiKey, image);

    let res;
    try {
      res = await fetch(`${TRIPO_API}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          type: 'image_to_model',
          file: { type: 'png', file_token: imageToken },
        }),
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

    if (taskRes.code !== 0) {
      console.log('Tripo error code:', taskRes.code, 'message:', taskRes.message);
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
      return new Response(JSON.stringify({ error: taskRes.message || 'Failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return task_id immediately - client will poll check-task
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
