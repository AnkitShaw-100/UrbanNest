import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTimes, FaPlus } from "react-icons/fa";
// import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api.ts";

const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: [] as string[],
    status: "active"
  });

  const [newAmenity, setNewAmenity] = useState("");

  // Dropdown options
  const propertyTypes = [
    "house", "apartment", "land", "villa", "condo", "townhouse", "studio", "penthouse"
  ];

  const availableAmenities = [
    "Parking", "Garden", "Balcony", "Terrace", "Swimming Pool", "Gym",
    "Security", "Lift", "Power Backup", "Water Supply", "Internet", "Furnished"
  ];

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // Add new amenity
  const addAmenity = () => {
    if (newAmenity.trim() && !form.amenities.includes(newAmenity.trim())) {
      setForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  // Remove amenity
  const removeAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Basic validations
      if (!form.title || !form.description || !form.price || !form.location ||
        !form.propertyType || !form.bedrooms || !form.bathrooms || !form.area) {
        throw new Error("Please fill in all required fields");
      }

      if (parseFloat(form.price) <= 0) throw new Error("Price must be greater than 0");
      if (parseFloat(form.area) <= 0) throw new Error("Area must be greater than 0");

      // Build JSON payload for backend (ensure numeric fields are numbers)
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        propertyType: form.propertyType,
        status: form.status,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        amenities: form.amenities,
        images: imageUrl ? [imageUrl] : [],
      } as any;

      const response = await apiClient.createProperty(payload as any);

      if (response.success) {
        // Persist locally for fallback display on /properties
        try {
          const created = (response as any).data || {};
          const existingRaw = localStorage.getItem('local_new_properties');
          const existing = existingRaw ? JSON.parse(existingRaw) : [];
          const withCreatedAt = {
            ...created,
            createdAt: created.createdAt || new Date().toISOString(),
          };
          const next = [withCreatedAt, ...existing].slice(0, 50);
          localStorage.setItem('local_new_properties', JSON.stringify(next));
        } catch { }

        setSuccess("Property created successfully!");
        setTimeout(() => {
          navigate('/seller/dashboard');
        }, 800);
      } else {
        throw new Error(response.error || "Property creation failed");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while creating the property");
    } finally {
      setLoading(false);
    }
  };

  // Block unauthorized access
  // if (!user || user.role !== 'seller') {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
  //         <p className="text-gray-600">You need to be logged in as a seller to add properties.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Property</h1>
            <p className="text-gray-600">List your property to reach potential buyers</p>
          </div>

          {/* Error/Success Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Basic Info */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property title"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your property..."
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              {/* Property Details */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of bedrooms"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of bathrooms"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Property area"
                />
              </div>

              {/* Amenities */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities</h2>

                {/* Custom Amenity */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Add custom amenity"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FaPlus />
                    </button>
                  </div>

                  {/* Predefined Amenities */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableAmenities.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm(prev => ({
                                ...prev,
                                amenities: [...prev.amenities, amenity]
                              }));
                            } else {
                              setForm(prev => ({
                                ...prev,
                                amenities: prev.amenities.filter(a => a !== amenity)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selected Amenities */}
                {form.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Selected Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {form.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <FaTimes />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Image</h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image URL (e.g. https://...)"
                />
                {imageUrl && (
                  <div className="mt-4">
                    <img
                      src={imageUrl}
                      alt="Property Preview"
                      className="w-full h-40 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  💡 Tip: Use a direct image URL from services like Imgur, Google Drive (public), or any image hosting service
                </p>
              </div>
            </div>

            {/* Submit / Cancel */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/seller/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                {loading ? "Adding Property..." : "Add Property"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProperty;
