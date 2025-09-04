import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaHeart, FaShare, FaPhone, FaEnvelope, FaArrowLeft, FaStar } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images?: string[];
  status: string;
  amenities?: string[];
  listedBy?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt?: string;
}

const PropertyDetail: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
      checkFavoriteStatus();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProperty(propertyId!);
      
      if (response.success && response.data) {
        setProperty(response.data);
      } else {
        // Try to get from local storage as fallback
        try {
          const localRaw = localStorage.getItem('local_new_properties');
          if (localRaw) {
            const localList: Property[] = JSON.parse(localRaw);
            const localProperty = localList.find(p => p._id === propertyId);
            if (localProperty) {
              setProperty(localProperty);
              return;
            }
          }
        } catch {}
        
        throw new Error(response.error || "Property not found");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        const isFav = response.data.some((p: Property) => p._id === propertyId);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      // navigate('/login');
      return;
    }

    if (!property) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await apiClient.removeFromFavorites(property._id);
        setIsFavorite(false);
      } else {
        await apiClient.addToFavorites(property._id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleContact = (type: 'phone' | 'email') => {
    if (!property) return;
    
    const contact = property.listedBy || property.owner;
    if (!contact) return;

    if (type === 'phone' && contact.phone) {
      window.open(`tel:${contact.phone}`);
    } else if (type === 'email') {
      window.open(`mailto:${contact.email}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The property you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [property.image];
  const contact = property.listedBy || property.owner;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Back to Properties
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Property Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  <span className="text-lg">{property.location}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FaBed className="mr-2 text-blue-500" />
                    <span>{property.bedrooms || 0} Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <FaBath className="mr-2 text-blue-500" />
                    <span>{property.bathrooms || 0} Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <FaRulerCombined className="mr-2 text-blue-500" />
                    <span>{property.area || 0} sq ft</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 lg:ml-8">
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ₹{property.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 capitalize mb-4">
                    {property.propertyType} • {property.status}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleFavoriteToggle}
                      disabled={favoriteLoading}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                        isFavorite
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaHeart className={`mr-2 ${isFavorite ? 'text-red-500' : ''}`} />
                      {isFavorite ? 'Favorited' : 'Favorite'}
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                      <FaShare className="mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={images[selectedImage] || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="w-full h-96 object-cover"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                              index === selectedImage ? 'border-blue-500' : 'border-white'
                            }`}
                          >
                            <img
                              src={image || '/placeholder-property.jpg'}
                              alt={`${property.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Property Type</span>
                      <span className="font-medium capitalize">{property.propertyType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Bedrooms</span>
                      <span className="font-medium">{property.bedrooms || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Bathrooms</span>
                      <span className="font-medium">{property.bathrooms || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Area</span>
                      <span className="font-medium">{property.area || 0} sq ft</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status</span>
                      <span className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                        property.status === 'active' ? 'bg-green-100 text-green-800' :
                        property.status === 'sold' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    {property.createdAt && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Listed</span>
                        <span className="font-medium">
                          {new Date(property.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <FaStar className="text-yellow-400 mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              {contact && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-gray-600">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-gray-600">{contact.phone}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      {contact.phone && (
                        <button
                          onClick={() => handleContact('phone')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                        >
                          <FaPhone className="mr-2" />
                          Call Now
                        </button>
                      )}
                      <button
                        onClick={() => handleContact('email')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                      >
                        <FaEnvelope className="mr-2" />
                        Send Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/properties')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium"
                  >
                    View More Properties
                  </button>
                  {user?.role === 'buyer' && (
                    <button
                      onClick={() => navigate('/buyer/dashboard')}
                      className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg font-medium"
                    >
                      Go to Dashboard
                    </button>
                  )}
                  {user?.role === 'seller' && (
                    <button
                      onClick={() => navigate('/seller/dashboard')}
                      className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-lg font-medium"
                    >
                      Go to Dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyDetail;
