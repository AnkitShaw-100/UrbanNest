import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaEye, FaHeart, FaBed, FaBath, FaRulerCombined } from "react-icons/fa";
import apiClient from "../../services/api";

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images?: string[];
  status: string;
  createdAt?: string;
}

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      // navigate('/login');
      return;
    }
    fetchProperties();
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserProperties();
      if (response.success && response.data) {
        setProperties(response.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch properties";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    navigate('/seller/add-property');
  };

  const handleEditProperty = (propertyId: string) => {
    navigate(`/seller/edit-property/${propertyId}`);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await apiClient.deleteProperty(propertyId);
        setProperties(properties.filter(p => p._id !== propertyId));
        // Show success message
        setError(""); // Clear any previous errors
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete property";
        setError(errorMessage);
      }
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      await apiClient.updateProperty(propertyId, { status: newStatus });
      setProperties(properties.map(p =>
        p._id === propertyId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update property status";
      setError(errorMessage);
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };
  
  if(!user)
  {
    return;
  }

  // if (!user || user.role !== 'seller') {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
  //         <p className="text-gray-600">You need to be logged in as a seller to access this page.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
              </div>
              <button
                onClick={handleAddProperty}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
              >
                <FaPlus />
                <span>Add New Property</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800">Total Properties</h3>
              <p className="text-3xl font-bold text-blue-600">{properties.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800">Active Listings</h3>
              <p className="text-3xl font-bold text-green-600">
                {properties.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800">Total Value</h3>
              <p className="text-3xl font-bold text-purple-600">
                ₹{properties.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Properties</h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No properties found. Add your first property!</p>
                <button
                  onClick={handleAddProperty}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Add Your First Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <motion.div
                    key={property._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    <div className="relative h-48">
                      <img
                        src={property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/400x300/cccccc/666666?text=Property+Image'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Property+Image';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusChange(property._id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${property.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : property.status === 'sold'
                                ? 'bg-red-100 text-red-800'
                                : property.status === 'rented'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="sold">Sold</option>
                          <option value="rented">Rented</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {property.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{property.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {property.propertyType}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <FaBed className="mr-1 text-blue-500" />
                          <span>{property.bedrooms || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FaBath className="mr-1 text-blue-500" />
                          <span>{property.bathrooms || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-1 text-blue-500" />
                          <span>{property.area || 0} sq ft</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {property.location}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProperty(property._id)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditProperty(property._id)}
                            className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">❤️ My Favorites</h2>
              <p className="text-gray-600 text-sm">Properties you've marked as favorites</p>
            </div>

            {favoritesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading favorites...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8">
                <FaHeart className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No favorites yet. Start exploring properties!</p>
                <button
                  onClick={() => navigate('/properties')}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((property) => (
                  <div
                    key={property._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                        <img
                          src={property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/64x64/cccccc/666666?text=Property'}
                          alt={property.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/64x64/cccccc/666666?text=Property';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{property.location}</p>
                        <p className="text-lg font-bold text-blue-600">₹{property.price.toLocaleString()}</p>
                        <button
                          onClick={() => navigate(`/property/${property._id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerDashboard; 