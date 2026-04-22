export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50 selection:bg-brand-gold selection:text-white">
      <aside className="w-72 bg-brand-green text-white shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg leading-none">AgriFlow</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mt-1">Admin Portal</span>
            </div>
          </div>
        </div>
        <nav className="px-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 ml-4">Management</div>
          <a href="/admin" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm mb-1 group">
            <span className="text-xl group-hover:scale-125 transition-transform">📊</span> <span>Dashboard</span>
          </a>
          <a href="/admin/orders" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm mb-1 group">
            <span className="text-xl group-hover:scale-125 transition-transform">📦</span> <span>Orders</span>
          </a>
          <a href="/admin/products" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm mb-1 group">
            <span className="text-xl group-hover:scale-125 transition-transform">🛍️</span> <span>Products</span>
          </a>
          <a href="/admin/categories" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm mb-1 group">
            <span className="text-xl group-hover:scale-125 transition-transform">📁</span> <span>Categories</span>
          </a>
          <div className="h-px bg-white/5 my-6 mx-4"></div>
          <a href="/" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm group">
            <span className="text-xl group-hover:scale-125 transition-transform">🏠</span> <span>Main Site</span>
          </a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="h-20 bg-white border-b border-neutral-100 flex items-center justify-between px-10 sticky top-0 z-10">
          <h2 className="font-black text-neutral-800 tracking-tight">System Overview</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-100 rounded-full border border-neutral-200"></div>
          </div>
        </header>
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  )
}