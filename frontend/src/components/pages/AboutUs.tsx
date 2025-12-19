import Ankit from "../../assets/team/Ankit.png";
import Amiya from "../../assets/team/Amiya.jpg";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const AboutUs = () => {
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
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Our Team & Mission
        </h2>
        <div className="w-20 h-1 bg-gray-900 mx-auto mb-6"></div>
        <p className="text-gray-700 text-md sm:text-lg max-w-3xl mx-auto">
          We are a passionate team building a smart, user-friendly real estate
          platform that connects buyers and sellers seamlessly. Our mission is
          to empower property transactions through innovation, transparency, and
          trust—helping people find their dream homes and investments with ease.
        </p>
      </div>

      {/* 🔹 Team Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Profile Image */}
            <div className="relative">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Name + Role + Icons */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {member.name}
              </h3>
              <p className="text-gray-700 font-medium">{member.role}</p>
              <div className="mt-4 flex justify-center space-x-3 text-gray-500">
                <a href={member.social.linkedin} aria-label="LinkedIn">
                  <FaLinkedin className="w-4 h-4" />
                </a>
                <a href={member.social.github} aria-label="GitHub">
                  <FaGithub className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AboutUs;
