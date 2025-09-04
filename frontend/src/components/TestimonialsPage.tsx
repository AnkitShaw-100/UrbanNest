import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const testimonials = [
    {
        name: "Amit Sharma",
        role: "Software Engineer",
        image: "https://randomuser.me/api/portraits/men/75.jpg", // Indian-looking male
        text:
            "The team made my first home purchase in Bangalore seamless. Their guidance and transparency were truly impressive. Highly recommended!"
    },
    {
        name: "Rahul Verma",
        role: "UI Designer",
        image: "https://randomuser.me/api/portraits/men/41.jpg",
        text:
            "Excellent service and support! They understood my requirements and helped me find a great rental in Pune within my budget."
    },
    {
        name: "Sneha Patel",
        role: "Product Manager",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        text:
            "Very professional and responsive team. They made the entire buying process stress-free and provided valuable advice at every step."
    },
    {
        name: "Vikram Iyer",
        role: "Entrepreneur",
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        text:
            "I was able to invest in a property in Hyderabad with ease. Their expertise and local knowledge are unmatched. Thank you for the support!"
    },
    {
        name: "Kavya Reddy",
        role: "Doctor",
        image: "https://randomuser.me/api/portraits/women/45.jpg",
        text:
            "PropArk helped me find the perfect clinic space in Chennai. Their understanding of commercial properties and patient requirements was excellent!"
    },
    {
        name: "Arjun Singh",
        role: "Business Analyst",
        image: "https://randomuser.me/api/portraits/men/33.jpg",
        text:
            "Being an analyst, I appreciate data-driven decisions. PropArk provided comprehensive market analysis that helped me make the right investment in Gurgaon."
    }
];

const TestimonialsPage = () => {
    const [current, setCurrent] = React.useState(0);

    const nextTestimonial = () => {
        setCurrent((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className="bg-gradient-to-b from-gray-50 to-gray-100 py-20 px-6 sm:px-16 font-sans relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20 -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-20 translate-x-32 translate-y-32"></div>

            <div className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
                        What Our <span className="text-blue-600">Clients</span> Say
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Discover why thousands of customers trust PropArk for their real estate needs
                    </p>
                </motion.div>

                <div className="max-w-3xl mx-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-3xl shadow-2xl px-10 py-12 border border-gray-100 relative"
                        >
                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                            <FaQuoteLeft className="text-4xl text-blue-500 mb-6 mx-auto" />

                            <p className="text-gray-700 text-lg leading-relaxed mb-8 font-medium italic">
                                "{testimonials[current].text}"
                            </p>

                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                                        <img
                                            src={testimonials[current].image}
                                            alt={testimonials[current].name}
                                            className="w-full h-full rounded-full object-cover object-center"
                                        />
                                    </div>
                                    {/* Verified badge */}
                                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-900 text-lg">
                                    {testimonials[current].name}
                                </p>
                                <p className="text-sm text-blue-600 font-medium">
                                    {testimonials[current].role}
                                </p>

                                {/* Stars */}
                                <div className="flex mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="w-5 h-5 text-yellow-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-10 px-6 sm:px-10">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={prevTestimonial}
                            className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-300 px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-md"
                        >
                            <FaChevronLeft />
                            Previous
                        </motion.button>

                        {/* Dots */}
                        <div className="flex space-x-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrent(index)}
                                    className={`h-3 rounded-full transition-all duration-300 ${index === current
                                        ? "bg-blue-600 w-8"
                                        : "bg-gray-300 w-3 hover:bg-gray-400"
                                        }`}
                                />
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={nextTestimonial}
                            className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-300 px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-md"
                        >
                            Next <FaChevronRight />
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsPage;
