import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    // Background set to blue-900
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Column 1 - About */}
        <div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Urban Nest</h2>
          <p className="text-gray-300 mb-6 text-base leading-relaxed">
            A proper place of value, convenience, and automated property
            solutions. We help you find homes effortlessly.
          </p>
          <div className="flex space-x-4 mt-4 text-white">
            {/* Icon hover color changed to blue-800 */}
            <a href="#" className="hover:text-blue-800">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-blue-800">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-blue-800">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Column 2 - Quick Links */}
        <div>
          <h3 className="text-2xl font-bold mb-4 tracking-tight">Quick Links</h3>
          <ul className="text-base text-gray-200 space-y-3">
            {/* Hover color changed to white for consistency */}
            <li>
              <a href="#" className="hover:text-white">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Terms of Use
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3 - Newsletter */}
        <div>
          <h3 className="text-2xl font-bold mb-4 tracking-tight">Stay Updated</h3>
          <p className="text-base text-gray-300 mb-6 leading-relaxed">
            Be the first to hear about offers, new listings, and news.
            Unsubscribe anytime.
          </p>
          <form className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-auto flex-1 px-4 py-2 rounded-md 
             bg-white text-gray-900 placeholder-gray-500 
             border border-gray-300 shadow-sm 
             focus:outline-none focus:ring-2 focus:ring-blue-800 
             transition duration-200 
             hover:ring-2 hover:ring-blue-400 hover:bg-blue-50"
              required
            />

            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-md shadow-md transition duration-150 flex items-center gap-2 "
            >
              Subscribe
            </button>
          </form>
        </div>
        {/* End grid container */}
        </div>
        {/* Bottom Section */}
        {/* Divider and border updated to blue-400 */}
        <div className="border-t border-white mt-14 pt-6 text-center text-base text-white">
          <p className="font-medium">&copy; 2025 Urban Nest. All Rights Reserved.</p>
          <div className="flex justify-center flex-wrap mt-4 gap-6 text-sm text-white">
          <a href="#" className="hover:text-white">
            About
          </a>
          <a href="#" className="hover:text-white">
            Jobs
          </a>
          <a href="#" className="hover:text-white">
            Help
          </a>
          <a href="#" className="hover:text-white">
            Contact
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
