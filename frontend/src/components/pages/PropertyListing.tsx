import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaFilter, FaMap, FaList, FaHeart } from "react-icons/fa";
import apiClient from "../../services/api.ts";
import { useAuth } from "../../context/AuthContext";

interface PersonRef { _id: string; name: string; email: string }

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
  listedBy?: PersonRef;
  owner?: PersonRef; 
  createdAt?: string;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const DEFAULT_LIMIT = 9;

const PropertyListing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState({
    propertyType: searchParams.get("type") || "",
    minPrice: searchParams.get("min") || "",
    maxPrice: searchParams.get("max") || "",
    bedrooms: searchParams.get("beds") || "",
    bathrooms: searchParams.get("baths") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    location: searchParams.get("loc") || "",
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") || "desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [recentSellerProperty, setRecentSellerProperty] = useState<Property | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);

  useEffect(() => {
    fetchProperties();
    if (user) {
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Recompute client-side filters whenever inputs change
    applyClientFiltersAndPaginate(allProperties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, JSON.stringify(filters), sortBy, sortOrder, page, limit]);

  useEffect(() => {
    const fetchRecentForSeller = async () => {
      if (!user || user.role !== 'seller') return;
      try {
        const res = await apiClient.getUserProperties();
        let list: Property[] = [];
        if (res.success && res.data && Array.isArray(res.data)) {
          list = res.data as unknown as Property[];
        }
        if (list.length === 0 && allProperties.length > 0) {
          // Fallback from overall list by owner/listedBy
          list = allProperties.filter(p => (p.owner?._id === user._id) || (p.listedBy?._id === user._id));
        }
        if (list.length > 0) {
          const sorted = [...list].sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
          });
          setRecentSellerProperty(sorted[0]);
        }
      } catch { }
    };
    fetchRecentForSeller();
  }, [user, allProperties]);

  const fetchFavorites = async () => {
    try {
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        const favoriteIds = new Set(response.data.map((p: Property) => p._id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleFavoriteToggle = async (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // navigate('/login');
      return;
    }

    try {
      if (favorites.has(propertyId)) {
        await apiClient.removeFromFavorites(propertyId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      } else {
        const full = properties.find(p => p._id === propertyId) || allProperties.find(p => p._id === propertyId);
        await apiClient.addToFavorites(propertyId, full);
        setFavorites(prev => new Set(prev).add(propertyId));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // 1) Get latest 4 active seller listings from API
      let latestSeller: Property[] = [];
      const response = await apiClient.getProperties({ status: 'active', limit: 4 });
      if (response.success && response.data) {
        latestSeller = (response.data.properties || []) as Property[];
      }

      // 2) Load dummy properties from local sample and take 8–9
      let dummyList: Property[] = [];
      // try {
      //   const res = await fetch('/properties.sample.json');
      //   if (res.ok) {
      //     const allDummy: Property[] = await res.json();
      //     dummyList = allDummy.slice(0, 9); // keep 8-9 dummy items
      //   }
      // } catch {}

      const combined = [...latestSeller];

      setAllProperties(combined);
      setError("");
      // Initial compute
      applyClientFiltersAndPaginate(combined);
    } catch (error) {
      // try {
      //   const res = await fetch('/properties.sample.json');
      //   if (res.ok) {
      //     const sample: Property[] = (await res.json()).slice(0, 9);
      //     setAllProperties(sample);
      //     setError("");
      //     applyClientFiltersAndPaginate(sample);
      //     return;
      //   }
      // } catch { }
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch properties";
      setError(errorMessage);
      setAllProperties([]);
      setProperties([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit });
    } finally {
      setLoading(false);
    }
  };

  const applyClientFiltersAndPaginate = (list: Property[]) => {
    // Filter
    let filtered = list.filter((p) => {
      const matchesType = !filters.propertyType || (p.propertyType?.toLowerCase() === filters.propertyType.toLowerCase());
      const matchesLoc = !filters.location || (p.location?.toLowerCase() === filters.location.toLowerCase());
      const matchesBeds = !filters.bedrooms || (Number(p.bedrooms || 0) >= Number(filters.bedrooms));
      const matchesBaths = !filters.bathrooms || (Number(p.bathrooms || 0) >= Number(filters.bathrooms));
      const matchesMinPrice = !filters.minPrice || (Number(p.price || 0) >= Number(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || (Number(p.price || 0) <= Number(filters.maxPrice));
      const matchesMinArea = !filters.minArea || (Number(p.area || 0) >= Number(filters.minArea));
      const matchesMaxArea = !filters.maxArea || (Number(p.area || 0) <= Number(filters.maxArea));
      const keyword = (searchTerm || '').trim().toLowerCase();
      const matchesKeyword = !keyword ||
        (p.title?.toLowerCase().includes(keyword) ||
          p.description?.toLowerCase().includes(keyword) ||
          p.location?.toLowerCase().includes(keyword));
      return matchesType && matchesLoc && matchesBeds && matchesBaths && matchesMinPrice && matchesMaxPrice && matchesMinArea && matchesMaxArea && matchesKeyword;
    });

    // Sort
    filtered.sort((a, b) => {
      let va = 0, vb = 0;
      switch (sortBy) {
        case 'price':
          va = a.price || 0; vb = b.price || 0; break;
        case 'area':
          va = a.area || 0; vb = b.area || 0; break;
        case 'bedrooms':
          va = a.bedrooms || 0; vb = b.bedrooms || 0; break;
        case 'createdAt':
        default:
          va = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          vb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;
    const pageItems = filtered.slice(start, start + limit);

    setProperties(pageItems);
    setPagination({ currentPage, totalPages, totalItems, itemsPerPage: limit });
  };

  const goToPage = (targetPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(targetPage));
    next.set("limit", String(limit));
    setSearchParams(next);
  };

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (searchTerm) next.set("q", searchTerm);
    if (filters.propertyType) next.set("type", filters.propertyType);
    if (filters.location) next.set("loc", filters.location);
    if (filters.bedrooms) next.set("beds", filters.bedrooms);
    if (filters.bathrooms) next.set("baths", filters.bathrooms);
    if (filters.minPrice) next.set("min", filters.minPrice);
    if (filters.maxPrice) next.set("max", filters.maxPrice);
    if (filters.minArea) next.set("minArea", filters.minArea);
    if (filters.maxArea) next.set("maxArea", filters.maxArea);
    if (sortBy) next.set("sortBy", sortBy);
    if (sortOrder) next.set("order", sortOrder);
    next.set("page", "1");
    next.set("limit", String(limit));
    setSearchParams(next);
    // No fetch; client-side filter will recompute via useEffect
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      minArea: "",
      maxArea: "",
      location: "",
    });
    setSortBy("createdAt");
    setSortOrder("desc");
    setSearchParams(new URLSearchParams({ page: "1", limit: String(limit) }));
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const propertyTypes = ["house", "apartment", "land", "villa", "condo", "townhouse", "studio", "penthouse"];
  // const locations = [...new Set(allProperties.map(p => p.location))]; // Removed unused variable

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Dream Property</h1>
            <p className="text-gray-600">Discover the perfect place to call home</p>
          </div>

          {/* Seller's Most Recent Listing */}
          {user && user.role === 'seller' && recentSellerProperty && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-blue-900">Your latest listing</h2>
                <button onClick={() => navigate('/seller/dashboard')} className="text-blue-700 hover:text-blue-800 font-medium">Go to Dashboard</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <img src={recentSellerProperty.image || recentSellerProperty.images?.[0] || '/placeholder-property.jpg'} alt={recentSellerProperty.title} className="w-full h-40 object-cover rounded-md" />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900">{recentSellerProperty.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{recentSellerProperty.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-blue-700 font-semibold">₹{recentSellerProperty.price.toLocaleString()}</div>
                    <button onClick={() => handlePropertyClick(recentSellerProperty._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">View</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {[...new Set(allProperties.map(p => p.location))].map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <FaFilter className="mr-2" />
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    <FaList className="inline mr-1" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "map"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    <FaMap className="inline mr-1" />
                    Map
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Bathrooms</label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Area (sq ft)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minArea}
                    onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Area (sq ft)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxArea}
                    onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                  Apply Filters
                </button>
                <button onClick={clearFilters} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                  Clear All
                </button>
              </div>

              <div className="text-sm text-gray-600">
                {pagination && `${pagination.totalItems} properties found`}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {properties.length} {properties.length === 1 ? 'result' : 'results'}
                {pagination && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
              </p>
              {properties.length > 0 && (
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">
                    {properties.filter(p => p.coordinates).length} with location data
                  </span>
                  {properties.filter(p => p.coordinates).length > 0 && (
                    <button
                      onClick={() => setViewMode("map")}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      <FaMap className="mr-1" />
                      View on Map
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Properties Display */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No properties found matching your criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear filters and try again
                  </button>
                </div>
              ) : (
                <>
                  {/* List View */}
                  {viewMode === "list" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {properties.map((property) => (
                        <motion.div
                          key={property._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handlePropertyClick(property._id)}
                        >
                          <div className="relative h-48">
                            <img
                              src={property.image || property.images?.[0] || 'https://via.placeholder.com/400x300/cccccc/666666?text=Property+Image'}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Property+Image';
                              }}
                            />
                            <div className="absolute top-4 right-4 flex space-x-2">
                              <button
                                onClick={(e) => handleFavoriteToggle(property._id, e)}
                                className={`p-2 rounded-full transition ${
                                  favorites.has(property._id)
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <FaHeart className={`text-sm ${favorites.has(property._id) ? 'text-white' : ''}`} />
                              </button>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {property.status || 'active'}
                              </span>
                            </div>
                            {(property.listedBy || property.owner) && (
                              <div className="absolute bottom-4 left-4">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {(property.listedBy?.name) || (property.owner?.name) || 'Seller'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{property.title}</h3>
                            <div className="flex items-center text-gray-600 mb-3">
                              <FaMapMarkerAlt className="mr-1" />
                              <span className="text-sm">{property.location}</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center"><FaBed className="mr-1" /><span>{property.bedrooms || '-'}</span></div>
                                <div className="flex items-center"><FaBath className="mr-1" /><span>{property.bathrooms || '-'}</span></div>
                                <div className="flex items-center"><FaRulerCombined className="mr-1" /><span>{property.area || '-'} sq ft</span></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold text-blue-600">₹{(property.price || 0).toLocaleString()}</p>
                                <p className="text-sm text-gray-500 capitalize">{property.propertyType}</p>
                              </div>
                              <div className="flex space-x-2">
                                {property.coordinates && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewMode("map");
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition flex items-center"
                                  >
                                    <FaMap className="mr-1" />
                                    Map
                                  </button>
                                )}
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                                  View Details
                                </button>
                              </div>
                            </div>
                            {property.createdAt && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  Listed {new Date(property.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Map View */}
                  {viewMode === "map" && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      {properties.filter(p => p.coordinates).length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text_gray-800">
                              Map View - {properties.filter(p => p.coordinates).length} Properties
                            </h3>
                            <p className="text-sm text-gray-500">
                              Properties with location data are shown below
                            </p>
                          </div>
                          <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                            <div className="text-center">
                              <FaMap className="text-5xl text-blue-400 mx-auto mb-4" />
                              <h4 className="text-xl font-semibold text-blue-600 mb-2">Interactive Map</h4>
                              <p className="text-blue-500 mb-4">
                                Map integration coming soon! For now, browse properties below.
                              </p>
                              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                {properties.filter(p => p.coordinates).length} properties with coordinates
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {properties.map((property) => (
                              <div
                                key={property._id}
                                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all hover:shadow-md"
                                onClick={() => handlePropertyClick(property._id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                    <img
                                      src={property.image || property.images?.[0] || '/placeholder-property.jpg'}
                                      alt={property.title}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-800 truncate">{property.title}</h4>
                                    <p className="text-sm text-gray-600 truncate flex items-center">
                                      <FaMapMarkerAlt className="mr-1 text-blue-500" />
                                      {property.location}
                                    </p>
                                    <p className="text-lg font-bold text-blue-600">₹{(property.price || 0).toLocaleString()}</p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                      <span>{property.bedrooms || '-'} beds</span>
                                      <span>•</span>
                                      <span>{property.bathrooms || '-'} baths</span>
                                      <span>•</span>
                                      <span>{property.area || '-'} sq ft</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <FaMap className="text-6xl text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Location Data</h3>
                            <p className="text-gray-500 mb-4">
                              None of the properties have coordinates yet.
                            </p>
                            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
                              Switch to List view to see all properties
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => goToPage(Math.max(1, (pagination?.currentPage || 1) - 1))}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {(() => {
                    const pages: React.ReactElement[] = [];
                    const totalPages = pagination.totalPages;
                    const currentPage = pagination.currentPage;

                    if (totalPages > 0) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className={`px-4 py-2 rounded border ${1 === currentPage ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                        >
                          1
                        </button>
                      );
                    }

                    if (currentPage > 4) {
                      pages.push(<span key="ellipsis1" className="px-2 py-2 text-gray-500">...</span>);
                    }

                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                      if (i > 1 && i < totalPages) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-4 py-2 rounded border ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                          >
                            {i}
                          </button>
                        );
                      }
                    }

                    if (currentPage < totalPages - 3) {
                      pages.push(<span key="ellipsis2" className="px-2 py-2 text-gray-500">...</span>);
                    }

                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className={`px-4 py-2 rounded border ${totalPages === currentPage ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  <button
                    onClick={() => goToPage(Math.min(pagination.totalPages, (pagination?.currentPage || 1) + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyListing; 