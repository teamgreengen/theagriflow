import { GET } from '../route'

describe('GET /health', () => {
  test('returns 200 with health payload', async () => {
    const res = await GET(new Request('https://example.test/health'))
    expect(res.status).toBe(200)
    const data = JSON.parse(await res.text())
    expect(data.status).toBe('ok')
  })
})
