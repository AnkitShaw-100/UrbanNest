import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTrash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api.ts";

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
  image: string;
  images?: string[];
  status: string;
  listedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch favorites jab user change ho ya mount pe
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  // API call to get favorites
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        setFavorites(response.data);
      } else {
        setError("Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError("Failed to fetch favorites");
    } finally {
      setLoading(false);
    }
  };

  // remove property from favorites
  const removeFavorite = async (propertyId: string) => {
    try {
      const response = await apiClient.removeFromFavorites(propertyId);
      if (response.success) {
        setFavorites(prev => prev.filter(prop => prop._id !== propertyId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // redirect to property details
  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  // agar user logged in nahi hai
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
  //         <p className="text-gray-600 mb-6">You need to be logged in to view your favorites.</p>
  //         <button
  //           onClick={() => navigate('/login')}
  //           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
  //         >
  //           Sign In
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Favorites</h1>
                <p className="text-gray-600">Properties you've saved for later</p>
              </div>
              <button
                onClick={() => navigate('/properties')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              >
                Browse Properties
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Favorites grid / Empty state */}
          {favorites.length === 0 ? (
            // empty state
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No favorites yet</h2>
              <p className="text-gray-600 mb-6">
                Start exploring properties and add them to your favorites to see them here.
              </p>
              <button
                onClick={() => navigate('/properties')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            // favorites list
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((property) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* property image */}
                  <div className="relative h-48">
                    <img
                      src={property.image || property.images?.[0] || '/placeholder-property.jpg'}
                      alt={property.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handlePropertyClick(property._id)}
                    />
                    {/* status badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {property.status}
                      </span>
                    </div>
                    {/* remove button */}
                    <button
                      onClick={() => removeFavorite(property._id)}
                      className="absolute top-4 left-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      title="Remove from favorites"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>

                  {/* property details */}
                  <div className="p-6">
                    <h3
                      className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition"
                      onClick={() => handlePropertyClick(property._id)}
                    >
                      {property.title}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <FaMapMarkerAlt className="mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    {/* property specs */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaBed className="mr-1" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <FaBath className="mr-1" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-1" />
                          <span>{property.area} sq ft</span>
                        </div>
                      </div>
                    </div>

                    {/* price + CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">₹{property.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{property.propertyType}</p>
                      </div>
                      <button
                        onClick={() => handlePropertyClick(property._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FavoritesPage;
