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
    <main className="min-h-screen bg-neutral-50 font-sans selection:bg-brand-gold selection:text-white">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.02]">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-emerald-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand-green/20 transform group-hover:rotate-6 transition-transform">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-neutral-900 leading-none">AgriFlow</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold mt-1">Farm to Table</span>
              </div>
            </Link>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-8 mr-4">
                <Link href="/" className="text-sm font-semibold text-neutral-600 hover:text-brand-green transition-colors">Market</Link>
                <Link href="/about" className="text-sm font-semibold text-neutral-600 hover:text-brand-green transition-colors">Our Story</Link>
              </nav>
              <div className="h-6 w-px bg-neutral-200 hidden md:block"></div>
              <Link href="/cart" className="p-2 text-neutral-600 hover:text-brand-green transition-colors relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </Link>
              <Link href="/login" className="px-6 py-2.5 bg-brand-green text-white text-sm font-bold rounded-full shadow-lg shadow-brand-green/30 hover:bg-emerald-900 transition-all duration-300 hover:scale-105 active:scale-95">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-brand-green/10 text-brand-green text-xs font-bold rounded-full mb-6 tracking-wider uppercase">
              100% Organic & Fresh
            </span>
            <h1 className="text-6xl md:text-7xl font-black text-neutral-900 mb-8 leading-[1.1]">
              Elevating your <span className="text-brand-green">kitchen</span> with gold-standard produce.
            </h1>
            <p className="text-xl text-neutral-600 mb-10 leading-relaxed max-w-xl">
              AgriFlow connects you directly with premium local farmers, bringing the harvest's finest to your doorstep within hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="px-10 py-4 bg-brand-green text-white rounded-full font-bold shadow-2xl shadow-brand-green/40 hover:bg-emerald-900 transition-all text-center">
                Start Shopping
              </Link>
              <Link href="/about" className="px-10 py-4 border-2 border-neutral-900 text-neutral-900 rounded-full font-bold hover:bg-neutral-900 hover:text-white transition-all text-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-1/3 h-full -z-10 opacity-10 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] bg-cover bg-center rounded-l-[100px]"></div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-neutral-900 mb-2">Curated Categories</h2>
              <div className="h-1.5 w-20 bg-brand-gold rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={'/?category=' + cat.id} className="group bg-neutral-50 p-8 rounded-3xl border border-neutral-100 hover:border-brand-green transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto mb-4 flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors duration-300">
                    <span className="font-bold text-xl uppercase">{cat.category.substring(0, 2)}</span>
                  </div>
                  <div className="text-sm font-bold text-neutral-900 tracking-tight">{cat.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-neutral-900 mb-4">Today's Harvest</h2>
            <p className="text-neutral-500">Exclusively selected premium products from our partner farms.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <Link key={product.id} href={'/product/' + product.id} className="group bg-white rounded-[32px] overflow-hidden border border-neutral-100 hover:shadow-2xl transition-all duration-500">
                <div className="aspect-[4/5] bg-neutral-100 relative overflow-hidden">
                  {product.img1 ? (
                    <img src={product.img1} alt={product.product_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 font-bold">AGRIFLOW</div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-brand-green shadow-sm">
                    Premium
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-black text-brand-gold uppercase tracking-widest mb-1">Organic</div>
                  <h3 className="font-bold text-lg text-neutral-900 mb-2 group-hover:text-brand-green transition-colors">{product.product_name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-brand-green">GH₵{product.price}</p>
                    <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="font-black text-2xl tracking-tight">AgriFlow</span>
              </Link>
              <p className="text-neutral-400 max-w-sm leading-relaxed mb-8">
                Empowering local agriculture and bringing premium, organic products directly to your doorstep. Join our mission for a healthier, sustainable future.
              </p>
              <div className="flex gap-4">
                {['facebook', 'instagram', 'twitter'].map(social => (
                  <div key={social} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-brand-green transition-colors cursor-pointer border border-white/10">
                    <span className="sr-only">{social}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Explore</h3>
              <ul className="space-y-4 text-neutral-400 text-sm">
                <li><Link href="/" className="hover:text-brand-green transition-colors">Marketplace</Link></li>
                <li><Link href="/about" className="hover:text-brand-green transition-colors">Our Producers</Link></li>
                <li><Link href="/login" className="hover:text-brand-green transition-colors">Partner with Us</Link></li>
                <li><Link href="/privacy" className="hover:text-brand-green transition-colors">Quality Assurance</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-4 text-neutral-400 text-sm">
                <li><Link href="/help" className="hover:text-brand-green transition-colors">Help Center</Link></li>
                <li><Link href="/delivery" className="hover:text-brand-green transition-colors">Delivery Info</Link></li>
                <li><span className="block text-neutral-200 font-semibold mb-1">Email Support</span> support@agriflow.com</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-neutral-500 text-xs">© 2026 AgriFlow International. All rights reserved.</p>
            <div className="flex gap-8 text-neutral-500 text-xs uppercase tracking-widest font-bold">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}