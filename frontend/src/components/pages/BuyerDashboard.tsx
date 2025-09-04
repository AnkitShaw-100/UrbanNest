import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEdit, FaSave, FaTimes, FaHeart, FaSearch, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaEye, FaTrash, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";

// property type
interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  description: string;
  image?: string;
  images?: string[];
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  status?: string;
}

// state type
type State = {
  favorites: Property[];
  loading: boolean;
  error: string;
};

// reducer
function reducer(state: State, action: any): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { favorites: action.payload, loading: false, error: "" };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter((p) => p._id !== action.payload),
      };
    default:
      return state;
  }
}

// Alert component
const AlertBox = ({
  type,
  message,
}: {
  type: "success" | "error" | null;
  message: string;
}) => {
  if (!type || !message) return null;

  const baseStyle =
    "p-3 mb-4 rounded-lg text-center font-medium shadow-md animate-fade-in";
  const styles: Record<"success" | "error", string> = {
    success: "bg-green-100 text-green-800 border border-green-300",
    error: "bg-red-100 text-red-800 border border-red-300"
  };

  return <div className={`${baseStyle} ${styles[type]}`}>{message}</div>;
};

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, {
    favorites: [],
    loading: true,
    error: "",
  });

  const [editing, setEditing] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // alert state
  const [alert, setAlert] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  // show alert
  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: null, message: "" }), 3000);
  };

  // fetch favorites
  const fetchFavorites = async () => {
    try {
      dispatch({ type: "FETCH_START" });
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        dispatch({ type: "FETCH_SUCCESS", payload: response.data });
      } else {
        dispatch({ type: "FETCH_ERROR", payload: "Failed to load favorites" });
        showAlert("error", "Failed to load favorites");
      }
    } catch {
      dispatch({ type: "FETCH_ERROR", payload: "Error loading favorites" });
      showAlert("error", "Error loading favorites");
    }
  };

  // remove favorite
  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await apiClient.removeFromFavorites(propertyId);
      if (response.success) {
        dispatch({ type: "REMOVE_FAVORITE", payload: propertyId });
        showAlert("success", "Removed from favorites");
      } else {
        showAlert("error", "Failed to remove favorite");
      }
    } catch {
      showAlert("error", "Error removing favorite");
    }
  };

  // profile update
  const handleProfileUpdate = async () => {
    try {
      setUpdatingProfile(true);
      const response = await apiClient.updateUserProfile(profileForm);
      if (response.success) {
        showAlert("success", "Profile updated successfully");
        setEditing(false);
      } else {
        showAlert("error", response.message || "Failed to update profile");
      }
    } catch {
      showAlert("error", "Error updating profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // auth + fetch
  useEffect(() => {
    if (!user || user.role !== "buyer") {
      // navigate("/login");
    } else {
      fetchFavorites();
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <AlertBox type={alert.type} message={alert.message} />

      {/* profile card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-2xl font-bold text-blue-900">👤 My Profile</h2>
          {editing ? (
            <div className="flex gap-3">
              <button
                onClick={handleProfileUpdate}
                disabled={updatingProfile}
                className={`p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition ${updatingProfile ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                <FaSave />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            >
              <FaEdit />
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-4 space-y-4">
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        ) : (
          <div className="mt-4 text-gray-700 space-y-2">
            <p><span className="font-medium text-gray-900">Name:</span> {user?.name}</p>
            <p><span className="font-medium text-gray-900">Email:</span> {user?.email}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
          >
            <FaSearch className="text-3xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Browse Properties</h3>
            <p className="text-blue-100 text-sm">Explore available properties</p>
          </button>
          
          <button
            onClick={() => navigate('/favorites')}
            className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
          >
            <FaHeart className="text-3xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">View Favorites</h3>
            <p className="text-red-100 text-sm">See your saved properties</p>
          </button>
          
          <button
            onClick={() => navigate('/contact')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
          >
            <FaEnvelope className="text-3xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <p className="text-green-100 text-sm">Get in touch for support</p>
          </button>
        </div>
      </div>

      {/* favorites section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-2xl font-bold text-blue-900">❤️ My Favorites</h2>
          <div className="text-sm text-gray-500">
            {state.favorites.length} {state.favorites.length === 1 ? 'property' : 'properties'} saved
          </div>
        </div>

        {state.loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading favorites...</p>
          </div>
        )}
        
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {state.error}</p>
          </div>
        )}

        {state.favorites.length === 0 && !state.loading ? (
          <div className="text-center py-12">
            <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start exploring properties and add them to your favorites!</p>
            <button
              onClick={() => navigate('/properties')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.favorites.map((property) => (
              <motion.div
                key={property._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative h-48">
                  <img
                    src={property.image || property.images?.[0] || 'https://via.placeholder.com/400x300/cccccc/666666?text=Property+Image'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Property+Image';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      property.status === 'active' ? 'bg-green-100 text-green-800' : 
                      property.status === 'sold' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status || 'active'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{property.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {property.propertyType || 'Property'}
                    </div>
                  </div>
                  
                  {(property.bedrooms || property.bathrooms || property.area) && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      {property.bedrooms && (
                        <div className="flex items-center">
                          <FaBed className="mr-1 text-blue-500" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center">
                          <FaBath className="mr-1 text-blue-500" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area && (
                        <div className="flex items-center">
                          <FaRulerCombined className="mr-1 text-blue-500" />
                          <span>{property.area} sq ft</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/property/${property._id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(property._id)}
                      className="text-red-500 hover:text-red-600 font-medium transition flex items-center p-2 rounded-full hover:bg-red-50"
                      title="Remove from favorites"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
