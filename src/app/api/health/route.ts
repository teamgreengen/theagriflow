/** Health check endpoint for production readiness checks */
export async function GET(_req: Request) {
  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
