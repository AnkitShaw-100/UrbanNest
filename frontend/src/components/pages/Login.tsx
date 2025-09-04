import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!form.email || !form.password) {
        throw new Error("Email and password are required");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        throw new Error("Please enter a valid email address");
      }

      const loggedInUser = await login(form.email, form.password);
      setSuccess("Login successful! Redirecting...");
      setForm({ email: "", password: "" });

      setTimeout(() => {
        if (loggedInUser?.role === "seller") {
          navigate("/seller/dashboard");
        } else if (loggedInUser?.role === "buyer") {
          navigate("/buyer/dashboard");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white flex items-center justify-center px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-5xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row border border-gray-100"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Left - Form */}
        <motion.div
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white"
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl font-extrabold text-gray-900 mb-3"
            variants={itemVariants}
          >
            Welcome Back 
          </motion.h2>
          <motion.p
            className="text-base text-gray-500 mb-8"
            variants={itemVariants}
          >
            Log in to your account and continue exploring the best properties.
          </motion.p>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm"
              variants={itemVariants}
            >
              {success}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={containerVariants}
          >
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
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition"
                placeholder="Enter your email"
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
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition"
                placeholder="Enter your password"
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-900 hover:bg-blue-800 text-white"
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              variants={itemVariants}
            >
              {loading ? "Logging In..." : "Log In"}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div className="flex items-center my-6" variants={itemVariants}>
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-sm text-gray-400">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </motion.div>

          {/* Links */}
          <motion.p
            className="text-sm text-center mt-4 text-gray-600"
            variants={itemVariants}
          >
            Don’t have an account?{" "}
            <Link
              to="/signup/buyer"
              className="text-blue-900 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </motion.p>
          <motion.p
            className="text-sm text-center mt-2 text-gray-600"
            variants={itemVariants}
          >
          </motion.p>
        </motion.div>

        {/* Right - Image */}
        <motion.div
          className="w-full md:w-1/2 hidden md:block bg-gray-50"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <img
            src="https://imgs.search.brave.com/TsZQpJzmC_hNbFj0ZfrgiDmREbo1bkMhbmfnpTktE2o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE2/MDI5NDE1MjU0MjEt/OGY4YjgxZDNlZGJi/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZpeGxp/Yj1yYi00LjEuMCZp/eGlkPU0zd3hNakEz/ZkRCOE1IeHpaV0Z5/WTJoOE9IeDhjSEp2/Y0dWeWRIbDhaVzU4/TUh4OE1IeDhmREE9"
            alt="Property in India"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
