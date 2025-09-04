import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/api.ts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BuyerSignup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!form.name || !form.email || !form.phone || !form.password) {
        throw new Error("All fields are required");
      }

      if (form.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Phone number validation (10 digits)
      if (!/^[0-9]{10}$/.test(form.phone)) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        throw new Error("Please enter a valid email address");
      }

      const userData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "buyer"
      };

      const response = await apiClient.register(userData);

      if (response.success) {
        setSuccess("Account created successfully! Redirecting to login...");
        // Clear form
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToSeller = () => {
    navigate("/signup/seller");
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-5xl w-full bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col md:flex-row transform -translate-y-[8%]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Left - Form */}
        <motion.div
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center"
          variants={containerVariants}
        >
          <motion.h2
            className="text-3xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            Create Your Account
          </motion.h2>
          <motion.p
            className="text-sm text-gray-500 mb-6"
            variants={itemVariants}
          >
            Sign up as buyer to get access to exclusive property listings and updates.
          </motion.p>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg"
              variants={itemVariants}
            >
              {success}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                placeholder="Enter your full name"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                placeholder="Enter your email"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                placeholder="Enter 10-digit phone number"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                placeholder="Enter password (min 6 characters)"
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-900 hover:bg-blue-800 text-white"
                }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              variants={itemVariants}
            >
              {loading ? "Creating Account..." : "Sign Up as Buyer"}
            </motion.button>
          </motion.form>

          {/* OR divider */}
          <motion.div className="flex items-center my-6" variants={itemVariants}>
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-sm text-gray-400">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </motion.div>

          {/* Seller Redirect */}
          <motion.button
            onClick={goToSeller}
            className="mt-6 w-full border border-blue-900 text-blue-900 hover:bg-blue-50 py-2 rounded-lg font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            Sign Up as Seller
          </motion.button>
        </motion.div>

        {/* Right - Image */}
        <motion.div
          className="w-full md:w-1/2 hidden md:block"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <img
            src="https://imgs.search.brave.com/TsZQpJzmC_hNbFj0ZfrgiDmREbo1bkMhbmfnpTktE2o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE2/MDI5NDE1MjU0MjEt/OGY4YjgxZDNlZGJi/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZpeGxp/Yj1yYi00LjEuMCZp/eGlkPU0zd3hNakEz/ZkRCOE1IeHpaV0Z5/WTJoOE9IeDhjSEp2/Y0dWeWRIbDhaVzU4/TUh4OE1IeDhmREE9"
            alt="Property Showcase"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BuyerSignup;
