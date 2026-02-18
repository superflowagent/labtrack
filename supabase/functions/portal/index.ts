// portal function removed — no-op stub
const serve = Deno.serve as unknown as (handler: (req: Request) => Promise<Response> | Response) => void;
serve(() => new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }));
