import Link from ''next/link''
async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''http://localhost:3000''
  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(baseUrl + ''/api/products?type=categories'', { cache: ''no-store'' }),
      fetch(baseUrl + ''/api/products?type=featured'', { cache: ''no-store'' })
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
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">20% Off Your First Order</h1>
            <p className="text-lg opacity-90">Fresh groceries delivered to your doorstep</p>
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Shop By Category</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={"/category/" + cat.id} className="flex-shrink-0 w-32 text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">BOX</div>
                <span className="text-sm font-medium">{cat.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {params.utm_source && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 8).map((product: any) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <img src={product.img1 || "/placeholder.png"} alt={product.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2">{product.product_name}</h3>
                    <div className="mt-2 flex gap-2">
                      <span className="text-lg font-bold text-green-600">GH{pounds}{product.fa}</span>
                      <span className="text-sm text-gray-400 line-through">GH{pounds}{product.price}</span>
                    </div>
                    <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm">Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} StingyMarket. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
