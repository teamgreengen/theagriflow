'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  product_name: string
  categories: { category: string }
  price: string
  fa: string
  qty: number
  approved: boolean
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    cat_id: '',
    price: '',
    fa: '',
    qty: ''
  })
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch (error) {
      console.error('Failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          fa: parseFloat(formData.fa),
          qty: parseInt(formData.qty) || 0
        })
      })
      setShowForm(false)
      setFormData({ product_name: '', cat_id: '', price: '', fa: '', qty: '' })
      fetchProducts()
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  const handleAction = async (id: string, action: string) => {
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      })
      fetchProducts()
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={formData.cat_id} onChange={(e) => setFormData({ ...formData, cat_id: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg" required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">MRP Price</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Final Price</label>
                <input type="number" value={formData.fa} onChange={(e) => setFormData({ ...formData, fa: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg" />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                Save Product
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 px-6 py-3 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{p.product_name}</td>
                  <td className="px-6 py-4">{p.categories?.category}</td>
                  <td className="px-6 py-4">GH₵{p.fa}</td>
                  <td className="px-6 py-4">{p.qty}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleAction(p.id, 'reject')}
                      className="text-red-600 hover:underline text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}