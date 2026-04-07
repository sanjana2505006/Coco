import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: <ShoppingBagIcon className="h-8 w-8" />,
      title: "Premium Products",
      description: "Curated selection of high-quality products"
    },
    {
      icon: <TruckIcon className="h-8 w-8" />,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep"
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "Great Prices",
      description: "Competitive prices with amazing deals"
    }
  ];

  const categories = [
    { name: "Electronics", image: "📱", color: "bg-blue-100" },
    { name: "Fashion", image: "👗", color: "bg-pink-100" },
    { name: "Home & Kitchen", image: "🏠", color: "bg-green-100" },
    { name: "Books", image: "📚", color: "bg-yellow-100" },
    { name: "Sports", image: "⚽", color: "bg-purple-100" }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-choco-600 to-choco-800 text-white rounded-2xl p-12 text-center">
        <h1 className="text-5xl font-bold mb-4">
          🍫 Welcome to Choco
        </h1>
        <p className="text-xl mb-8 text-choco-100">
          Discover amazing products at unbeatable prices
        </p>
        <Link 
          to="/products" 
          className="btn-primary bg-white text-choco-700 hover:bg-choco-50 inline-block"
        >
          Start Shopping
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="card text-center">
            <div className="text-choco-600 mb-4 flex justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={`/products?category=${category.name}`}
              className={`${category.color} rounded-xl p-6 text-center hover:scale-105 transition-transform duration-200`}
            >
              <div className="text-4xl mb-2">{category.image}</div>
              <h3 className="font-medium text-gray-800">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Shopping?
        </h2>
        <p className="text-gray-600 mb-8">
          Join thousands of satisfied customers who trust Choco for their shopping needs
        </p>
        <div className="space-x-4">
          <Link to="/register" className="btn-primary">
            Sign Up Now
          </Link>
          <Link to="/products" className="btn-outline">
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
