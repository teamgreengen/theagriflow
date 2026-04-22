export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="font-bold text-xl">Admin Panel</h1>
        </div>
        <nav className="py-4">
          <a href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 bg-gray-800">
            📊 <span>Dashboard</span>
          </a>
          <a href="/admin/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800">
            📦 <span>Orders</span>
          </a>
          <a href="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800">
            🛍️ <span>Products</span>
          </a>
          <a href="/admin/categories" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800">
            📁 <span>Categories</span>
          </a>
          <a href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 mt-8">
            🏠 <span>Back to Site</span>
          </a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}