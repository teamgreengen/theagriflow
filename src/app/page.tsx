import Link from 'next/link'

async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(baseUrl + '/api/products?type=categories', { cache: 'no-store' }),
      fetch(baseUrl + '/api/products?type=featured', { cache: 'no-store' })
    ])
    const categoriesData = await categoriesRes.json()
    const productsData = await productsRes.json()
    return { categories: categoriesData.success ? categoriesData.data : [], products: productsData.success ? productsData.data : [] }
  } catch { return { categories: [], products: [] } }
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ utm_source?: string }> }) {
  const params = await searchParams
  const { categories, products } = await getData()

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-semibold text-gray-900">StingyMarket</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-lg">CART</Link>
              <Link href="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg">Login</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Fresh groceries delivered to your door</h1>
          <p className="text-xl mb-8">Quality products at affordable prices</p>
          <Link href="/login" className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold">Shop Now</Link>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={'/?category=' + cat.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center">
                <div className="text-lg font-medium">{cat.category}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link key={product.id} href={'/product/' + product.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gray-100">
                  {product.img1 && <img src={product.img1} alt={product.product_name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">{product.product_name}</h3>
                  <p className="text-green-600 font-bold">GH₵{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">StingyMarket</h3>
              <p className="text-gray-400">Your trusted online grocery store</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-gray-400">Email: support@stingymarket.com</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}