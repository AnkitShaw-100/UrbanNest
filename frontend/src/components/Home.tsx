import { motion } from "framer-motion";
import homePage from "../assets/homePage.jpg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gray-50 font-sans">
      {/* Hero Section */}
      <section
        className="relative px-4 sm:px-8 lg:px-20 pt-24 pb-52 bg-cover bg-center rounded-b-[3rem]"
        style={{
          backgroundImage: `url(${homePage})`,
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60 rounded-b-[3rem] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center text-white z-10">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-xl"
          >
            Buy, Sell, Rent <br className="hidden sm:block" />
            &amp; Collaborate on Property
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl mb-10 opacity-90 drop-shadow max-w-2xl mx-auto"
          >
            Choose a property service and start exploring with ease.
          </motion.p>

        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-20 py-24 grid md:grid-cols-2 gap-14 items-center">
        {/* Text Side */}
        <div className="space-y-6 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug">
            We Are Spread All <br className="hidden sm:block" />
            Over the Archipelago.
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto md:mx-0">
            Serving 50+ cities, 120k+ listings, and thousands of happy customers
            with the best real estate services.
          </p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white font-semibold rounded-lg transition-all shadow-md"
            onClick={() => navigate("/properties")}
          >
            See Our Projects
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 text-center">
          {[
            { value: "300K+", label: "Property Searches" },
            { value: "48+", label: "Cities" },
            { value: "52K+", label: "Customers" },
            { value: "125K+", label: "Listings Posted" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 border border-gray-100"
            >
              <p className="text-3xl font-bold text-blue-900">{stat.value}</p>
              <p className="text-gray-600 text-sm sm:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
