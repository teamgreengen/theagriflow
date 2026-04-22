'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  category: string
  status: number
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCat, setNewCat] = useState('')

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch (error) {
      console.error('Failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCat })
      })
      setNewCat('')
      fetchCategories()
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  const toggleStatus = async (id: string, currentStatus: number) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: currentStatus === 1 ? 0 : 1 })
      })
      fetchCategories()
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <form onSubmit={addCategory} className="flex gap-2 mb-6">
        <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name"
          className="flex-1 px-4 py-2 border rounded-lg" required />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Add
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 font-medium">{cat.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${cat.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {cat.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(cat.id, cat.status)}
                      className="text-blue-600 hover:underline">
                      {cat.status === 1 ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No categories</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}