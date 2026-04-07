import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, MapPinIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface Address {
  address_id: number;
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  is_default: boolean;
}

interface Order {
  order_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: any[];
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchProfile();
    fetchAddresses();
    fetchOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-gray-600">Manage your profile and orders</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b">
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
          { id: 'orders', label: 'Orders', icon: ShoppingBagIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-choco-600 text-choco-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && user && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <p className="text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <p className="text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <p className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Shipping Addresses</h2>
            <button className="btn-primary">Add New Address</button>
          </div>

          {addresses.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No addresses saved yet</p>
              <button className="btn-primary">Add Your First Address</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div key={address.address_id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">
                      {address.is_default && (
                        <span className="bg-choco-100 text-choco-700 text-xs px-2 py-1 rounded-full mr-2">
                          Default
                        </span>
                      )}
                      Shipping Address
                    </h3>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.zip_code}
                    </p>
                    <p>{address.country}</p>
                  </div>
                  <div className="mt-4 space-x-2">
                    <button className="btn-secondary text-sm">Edit</button>
                    {!address.is_default && (
                      <button className="btn-outline text-sm">Set as Default</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Order History</h2>

          {orders.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No orders yet</p>
              <Link to="/products" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.order_id}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-lg font-semibold mt-2">${order.total_amount}</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button className="btn-secondary text-sm">View Details</button>
                    {order.status === 'pending' && (
                      <button className="btn-outline text-sm text-red-600 border-red-600">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
