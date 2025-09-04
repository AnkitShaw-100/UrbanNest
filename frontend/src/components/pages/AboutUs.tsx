import { motion } from "framer-motion";
import Ankit from "../../assets/team/Ankit.png";
import Amiya from "../../assets/team/Amiya.jpg";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const AboutUs = () => {
  // 👥 Team members data (name, role, image, socials)
  const teamMembers = [
    {
      name: "Ankit Shaw",
      role: "Backend Developer",
      image: Ankit,
      social: {
        linkedin: "https://www.linkedin.com/in/ankit-shaw-884b0728a/",
        github: "https://github.com/AnkitShaw-100",
      },
    },
    {
      name: "Amiya Mishu",
      role: "Frontend Developer",
      image: Amiya,
      social: {
        linkedin: "https://www.linkedin.com/in/amiya-mishu-871913272",
        github: "https://github.com/AmiyaMishu",
      },
    },
    {
      name: "Sakshi Gupta",
      role: "AI/ML Developer",
      image: Ankit,
      social: {
        linkedin: "https://www.linkedin.com/in/sakshi-gupta-28498a28a",
        github: "https://github.com/Sakshii2118",
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* 🔹 Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Meet Our <span className="text-blue-800">Team</span>
        </h2>
        <div className="w-20 h-1 bg-blue-900 mx-auto mb-6"></div>
        <p className="text-gray-600 text-md sm:text-lg max-w-3xl mx-auto">
          Behind our real estate platform is a talented team of developers and designers
          committed to transforming property buying and selling into a seamless experience.
        </p>
      </div>

      {/* 🔹 Team Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
          >
            {/* 👤 Profile Image with hover social icons */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              {/* Social icons overlay (visible on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div className="flex space-x-4 text-white">
                  <a href={member.social.linkedin} aria-label="LinkedIn">
                    <FaLinkedin className="w-5 h-5 hover:text-blue-800 transition" />
                  </a>
                  <a href={member.social.github} aria-label="GitHub">
                    <FaGithub className="w-5 h-5 hover:text-blue-800 transition" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* 👤 Name + Role + Small icons */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
              <p className="text-blue-900 font-medium">{member.role}</p>
              <div className="mt-4 flex justify-center space-x-3">
                <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-800">
                  <FaLinkedin className="w-4 h-4" />
                </a>
                <a href={member.social.github} className="text-gray-400 hover:text-blue-800">
                  <FaGithub className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🔹 Divider line with icon */}
      <div className="mt-20 mb-16">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-gray-500">
              <svg
                className="w-8 h-8 text-blue-900"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 Mission Statement */}
      <div className="max-w-4xl mx-auto text-center px-4">
        <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
          Our Mission
        </h3>
        <p className="text-gray-600 text-md sm:text-lg leading-relaxed">
          Our mission is to redefine the real estate experience by building a smart,
          user-friendly platform that connects buyers and sellers seamlessly.
          We aim to empower property transactions through innovation, transparency,
          and trust—helping people find their dream homes and investments with ease.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
