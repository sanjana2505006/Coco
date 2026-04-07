import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image_url: string;
  stock: number;
  category_name: string;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const category = searchParams.get('category');
  const search = searchParams.get('search');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [category, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories/list');
      const data = await response.json();
      setCategories(data.map((cat: any) => cat.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });

      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {category ? `${category} Products` : search ? `Search Results for "${search}"` : 'All Products'}
      </h1>

      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.location.href = '/products'}
            className={`px-4 py-2 rounded-lg ${!category ? 'bg-choco-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => window.location.href = `/products?category=${cat}`}
              className={`px-4 py-2 rounded-lg ${category === cat ? 'bg-choco-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.product_id} className="product-card">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl">📦</div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center mb-2">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm ml-1">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 ml-2">({product.category_name})</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-choco-700">${product.price}</span>
                  <span className="text-sm text-gray-500">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                
                <button
                  onClick={() => addToCart(product.product_id)}
                  disabled={product.stock === 0}
                  className={`w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                    product.stock === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-choco-600 text-white hover:bg-choco-700'
                  }`}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
