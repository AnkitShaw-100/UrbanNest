import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
// Icons removed for a cleaner, professional UI
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
  properties: Property[];
  loading: boolean;
  error: string;
};

// action type
type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Property[] }
  | { type: "FETCH_ERROR"; payload: string };

// reducer
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { properties: action.payload, loading: false, error: "" };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
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
    error: "bg-red-100 text-red-800 border border-red-300",
  };

  return <div className={`${baseStyle} ${styles[type]}`}>{message}</div>;
};

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, {
    properties: [],
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

  // fetch all properties from database
  const fetchAllProperties = async () => {
    try {
      dispatch({ type: "FETCH_START" });
      const response = await apiClient.getProperties();
      if (response.success && response.data) {
        dispatch({ type: "FETCH_SUCCESS", payload: response.data.properties });
      } else {
        dispatch({ type: "FETCH_ERROR", payload: "Failed to load properties" });
        showAlert("error", "Failed to load properties");
      }
    } catch {
      dispatch({ type: "FETCH_ERROR", payload: "Error loading properties" });
      showAlert("error", "Error loading properties");
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
      fetchAllProperties();
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <AlertBox type={alert.type} message={alert.message} />

      {/* profile card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-2xl font-bold text-blue-900">My Profile</h2>
          {editing ? (
            <div className="flex gap-3">
              <button
                onClick={handleProfileUpdate}
                disabled={updatingProfile}
                className={`px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition text-sm font-medium ${
                  updatingProfile ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
            >
              Edit Profile
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
            <p>
              <span className="font-medium text-gray-900">Name:</span>{" "}
              {user?.name}
            </p>
            <p>
              <span className="font-medium text-gray-900">Email:</span>{" "}
              {user?.email}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/properties")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">Browse Properties</h3>
            <p className="text-blue-100 text-sm">
              Explore available properties
            </p>
          </button>

          <button
            onClick={() => navigate("/favorites")}
            className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">View Favorites</h3>
            <p className="text-red-100 text-sm">See your saved properties</p>
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <p className="text-green-100 text-sm">Get in touch for support</p>
          </button>
        </div>
      </div>

      {/* favorites section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-2xl font-bold text-blue-900">All Properties</h2>
          <div className="text-sm text-gray-500">
            {state.properties.length}{" "}
            {state.properties.length === 1 ? "property" : "properties"} available
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

        {state.properties.length === 0 && !state.loading ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No properties available
            </h3>
            <p className="text-gray-500 mb-6">
              Check back soon for new property listings!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.properties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 overflow-hidden p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 leading-tight flex-1 line-clamp-1">
                    {property.title}
                  </h3>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                      property.status === "active"
                        ? "bg-green-100 text-green-800"
                        : property.status === "sold"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {property.status || "active"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-xl font-bold text-blue-600">
                    ₹{property.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {property.propertyType || "Property"}
                  </div>
                </div>

                {(property.bedrooms ||
                  property.bathrooms ||
                  property.area) && (
                  <div className="text-xs text-gray-600 mb-3">
                    <span>
                      {property.bedrooms ? `${property.bedrooms} Beds` : ""}
                    </span>
                    {property.bedrooms && property.bathrooms && (
                      <span className="mx-1">•</span>
                    )}
                    <span>
                      {property.bathrooms ? `${property.bathrooms} Baths` : ""}
                    </span>
                    {(property.bedrooms || property.bathrooms) && property.area && (
                      <span className="mx-1">•</span>
                    )}
                    <span>{property.area ? `${property.area} sq ft` : ""}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/property/${property._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded text-xs font-medium transition flex-1 text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
