import { motion } from "framer-motion";
import homePage from "../assets/homePage.jpg";
import GodrejLogo from "../assets/companyLogo/GodrejLogo.png";
import LodhaLogo from "../assets/companyLogo/LodhaLogo.png";
import ParkLogo from "../assets/companyLogo/ParkLogo.png";
import PrologisLogo from "../assets/companyLogo/PrologisLogo.png";
import SobhaLogo from "../assets/companyLogo/SobhaLogo.png";

const benefits = [
  {
    number: "01",
    title: "Exclusive Property Access",
    desc: "Unlock premium real estate projects from trusted developers before they reach the wider market—giving you and your clients a competitive edge.",
  },
  {
    number: "02",
    title: "Your Privacy, Guaranteed",
    desc: "We protect your data with industry-leading security standards. Every transaction remains safe, confidential, and fully compliant with legal frameworks.",
  },
  {
    number: "03",
    title: "Simplified & Rewarding Transactions",
    desc: "Streamlined property search and seamless deals ensure faster closures—helping you earn commissions without unnecessary delays.",
  },
];

const companyLogos = [GodrejLogo, LodhaLogo, ParkLogo, PrologisLogo, SobhaLogo];

const Benefits = () => {
  return (
    <section className="w-full bg-gray-50 px-6 sm:px-16 py-20 font-sans">
      {/* Section Heading */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight"
        >
          Why Choose <span className="text-blue-700">Us</span>?
        </motion.h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          We provide real estate professionals with smarter tools, secure
          solutions, and opportunities that set them apart from the competition.
        </p>
      </div>

      {/* Benefit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto mb-20">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-gray-200"
          >
            {/* Number */}
            <div className="absolute -top-6 left-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-2xl font-bold px-4 py-2 rounded-xl shadow-md">
              {benefit.number}
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
              {benefit.title}
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              {benefit.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Image Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl mb-20"
      >
        <img
          src={homePage}
          alt="Modern Building"
          className="w-full h-[480px] sm:h-[550px] object-cover"
        />
      </motion.div>

      {/* Infinite Logo Carousel */}
      <div className="relative bg-white py-10 overflow-hidden">
        <div className="marquee-track flex w-max animate-marquee">
          {[...companyLogos, ...companyLogos].map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt="Company Logo"
              className="h-14 sm:h-16 object-contain mx-10 transition duration-300"
            />
          ))}
        </div>

        <style>{`
          .marquee-track {
            display: flex;
            animation: marquee 20s linear infinite;
          }
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default Benefits;
