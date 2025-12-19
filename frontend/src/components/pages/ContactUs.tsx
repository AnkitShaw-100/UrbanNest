import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // ✅ form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call with setTimeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Simulate success response
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Have questions about our properties or services? We’d love to hear
              from you — let’s find your dream home together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-start">
            {/* Contact Information */}
            <div className="space-y-4 max-w-xl lg:pr-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Reach out to us directly or fill out the form — we usually reply
                within 24 hours.
              </p>

              <div className="space-y-4 mt-4">
                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <FaEnvelope className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-base text-gray-600">ankitTest@gmail.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <FaPhone className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Phone</h3>
                    <p className="text-base text-gray-600">+91 77777 77770</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <FaMapMarkerAlt className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Office</h3>
                    <p className="text-base text-gray-600">
                      123 Dummy Address, Kolkata - 700091
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <FaClock className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Office Hours</h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      Mon - Fri: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-5 lg:p-6 border border-gray-100 mx-auto" style={{ width: "75%" }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                Send Us a Message
              </h2>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-400 text-green-700 rounded-lg">
                  Thank you for your message! We’ll get back to you soon.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg">
                  Oops! Something went wrong. Please try again.
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your phone number (optional)"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-800 text-white font-semibold shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 disabled:bg-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;
