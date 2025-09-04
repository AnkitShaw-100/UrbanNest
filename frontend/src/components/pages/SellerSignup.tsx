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

const SellerSignup: React.FC = () => {
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // clear error while typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!form.name || !form.email || !form.phone || !form.password) {
        throw new Error("All fields are required");
      }
      if (form.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (!/^[0-9]{10}$/.test(form.phone)) {
        throw new Error("Please enter a valid 10-digit phone number");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        throw new Error("Please enter a valid email address");
      }

      const userData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "seller",
      };

      const response = await apiClient.register(userData);

      if (response.success) {
        setSuccess("✅ Account created successfully! Redirecting to login...");
        setForm({ name: "", email: "", phone: "", password: "" });

        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToBuyer = () => {
    navigate("/signup/buyer");
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-5xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row transform -translate-y-[6%]"
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
            className="text-3xl font-bold text-gray-900 mb-3"
            variants={itemVariants}
          >
            Register as a Seller
          </motion.h2>
          <motion.p
            className="text-sm text-gray-500 mb-6 leading-relaxed"
            variants={itemVariants}
          >
            Create your seller account to list properties and connect with
            genuine buyers across India.
          </motion.p>

          {/* Error / Success */}
          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-50 border border-red-400 text-red-700 rounded-lg text-sm"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              className="mb-4 p-3 bg-green-50 border border-green-400 text-green-700 rounded-lg text-sm"
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
            {[
              {
                label: "Full Name",
                name: "name",
                type: "text",
                placeholder: "Enter your full name",
              },
              {
                label: "Email Address",
                name: "email",
                type: "email",
                placeholder: "Enter your email address",
              },
              {
                label: "Phone Number",
                name: "phone",
                type: "tel",
                placeholder: "Enter Phone number",
              },
              {
                label: "Password",
                name: "password",
                type: "password",
                placeholder: "Create a strong password",
              },
            ].map((field, index) => (
              <motion.div key={index} variants={itemVariants}>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition"
                />
              </motion.div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-900 hover:bg-blue-800 text-white"
              }`}
              variants={itemVariants}
              whileHover={!loading ? { scale: 1.03 } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
            >
              {loading ? "Creating Account..." : "Register as Seller"}
            </motion.button>
          </motion.form>

          <motion.p
            className="text-sm text-center mt-6 text-gray-600"
            variants={itemVariants}
          >
            Already registered?{" "}
            <a
              href="/login"
              className="text-blue-800 font-semibold hover:underline"
            >
              Log in
            </a>
          </motion.p>

          {/* Buyer Redirect */}
          <motion.button
            onClick={goToBuyer}
            className="mt-6 w-full border border-blue-900 text-blue-900 hover:bg-blue-50 py-2.5 rounded-lg font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            Register as Buyer
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
            alt="Indian Property"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SellerSignup;
