import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX, HiLogout, HiCog, HiHeart } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [signupDropdown, setSignupDropdown] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setSignupDropdown(false);
                setUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

    const handleBuyNow = () => {
        if (!user) {
            // Redirect to login if user is not authenticated
            navigate('/login');
        } else {
            // User is logged in, go to properties
            navigate('/properties');
        }
    };

    const navLinks = [
        { text: "Home", path: "/" },
        { text: "Properties", path: "/properties" },
        { text: "Services", path: "/services" },
        { text: "About", path: "/about" },
        { text: "Contact", path: "/contact" },
    ];

    const userNavLinks = user ? [
        { text: "Favorites", path: "/favorites", icon: <HiHeart className="w-4 h-4" /> },
        { text: "Dashboard", path: user.role === 'seller' ? "/seller/dashboard" : "/buyer/dashboard", icon: <HiCog className="w-4 h-4" /> },
    ] : [];

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-blue-900">
                            UrbanNest
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.text}
                                to={link.path}
                                className="group relative text-slate-800 font-medium text-base cursor-pointer transition-colors duration-200 hover:text-blue-800"
                            >
                                {link.text}
                                <span
                                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-0 group-hover:w-3/4 h-0.5 bg-blue-800 transition-all duration-300 origin-center rounded-full"
                                ></span>
                            </Link>
                        ))}
                        
                        {/* User-specific navigation links */}
                        {userNavLinks.map((link) => (
                            <Link
                                key={link.text}
                                to={link.path}
                                className="flex items-center gap-2 text-slate-800 font-medium text-base cursor-pointer transition-colors duration-200 hover:text-blue-800"
                            >
                                {link.icon}
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex space-x-2 sm:space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                {/* User Profile Icon with Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setUserDropdown(!userDropdown)}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-800 text-white font-semibold shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                                    >
                                        <span>{user.name}</span>
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${userDropdown ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' /></svg>
                                    </button>
                                    {userDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 animate-fadeIn">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                <p className="text-xs text-blue-600 font-medium capitalize">{user.role}</p>
                                            </div>

                                            <Link
                                                to={user.role === 'seller' ? "/seller/dashboard" : "/buyer/dashboard"}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                onClick={() => setUserDropdown(false)}
                                            >
                                                <HiCog className="w-4 h-4 mr-3 text-gray-500" />
                                                Dashboard
                                            </Link>

                                            <Link
                                                to="/favorites"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                onClick={() => setUserDropdown(false)}
                                            >
                                                <HiHeart className="w-4 h-4 mr-3 text-gray-500" />
                                                Favorites
                                            </Link>

                                            <div className="border-t border-gray-100 my-1"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                            >
                                                <HiLogout className="w-4 h-4 mr-3" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleBuyNow}
                                    className="ml-2 px-5 py-2 rounded-lg border border-blue-800 text-blue-800 bg-white font-semibold shadow-sm hover:bg-blue-100 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    Buy now
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setSignupDropdown(!signupDropdown)}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-800 text-white font-semibold shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                                    >
                                        <span>Sign In</span>
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${signupDropdown ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' /></svg>
                                    </button>
                                    {signupDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-blue-100 animate-fadeIn">
                                            <Link
                                                to="/login"
                                                className="block px-5 py-2 text-base text-blue-900 font-medium hover:bg-blue-50 hover:text-blue-800 rounded-t-lg transition"
                                                onClick={() => setSignupDropdown(false)}
                                            >
                                                Login
                                            </Link>
                                            <div className="border-t border-blue-100"></div>
                                            <Link
                                                to="/signup/buyer"
                                                className="block px-5 py-2 text-base text-blue-900 font-medium hover:bg-blue-50 hover:text-blue-800 transition"
                                                onClick={() => setSignupDropdown(false)}
                                            >
                                                Sign up as Buyer
                                            </Link>
                                            <Link
                                                to="/signup/seller"
                                                className="block px-5 py-2 text-base text-blue-900 font-medium hover:bg-blue-50 hover:text-blue-800 rounded-b-lg transition"
                                                onClick={() => setSignupDropdown(false)}
                                            >
                                                Sign up as Seller
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleBuyNow}
                                    className="ml-2 px-5 py-2 rounded-lg border border-blue-800 text-blue-800 bg-white font-semibold shadow-sm hover:bg-blue-100 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    Buy now
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Icon */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-2xl text-slate-800 hover:text-blue-800 focus:outline-none"
                        >
                            {menuOpen ? <HiX /> : <HiMenu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {menuOpen && (
                    <div className="md:hidden px-4 pt-4 pb-6 space-y-4 bg-slate-50 border-t border-slate-200">
                        {navLinks.map((link) => (
                            <Link
                                key={link.text}
                                to={link.path}
                                className="block text-slate-800 font-medium text-base cursor-pointer hover:text-blue-800"
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.text}
                            </Link>
                        ))}
                        <div className="flex flex-col space-y-3 pt-4 border-t border-slate-200">
                            {user ? (
                                <>

                                    <Link
                                        to="/favorites"
                                        className="flex items-center justify-center text-blue-800 px-4 py-2 rounded bg-slate-200 font-medium hover:bg-slate-300"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Favorites
                                    </Link>
                                    <Link
                                        to={user.role === 'seller' ? "/seller/dashboard" : "/buyer/dashboard"}
                                        className="flex items-center justify-center text-blue-800 px-4 py-2 rounded bg-slate-200 font-medium hover:bg-slate-300"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center text-red-600 px-4 py-2 rounded border border-red-600 font-medium hover:bg-red-50"
                                    >
                                        <HiLogout className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-blue-800 px-4 py-2 rounded bg-slate-200 font-medium hover:bg-slate-300 text-center"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <div className="text-sm text-gray-500 text-center">Or sign up as:</div>
                                    <Link
                                        to="/signup/buyer"
                                        className="text-white bg-green-600 px-4 py-2 rounded font-medium hover:bg-green-700 text-center"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Buyer
                                    </Link>
                                    <Link
                                        to="/signup/seller"
                                        className="text-white bg-green-600 px-4 py-2 rounded font-medium hover:bg-green-700 text-center"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Seller
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleBuyNow();
                                            setMenuOpen(false);
                                        }}
                                        className="text-white bg-blue-900 px-4 py-2 rounded font-semibold hover:bg-blue-800 text-center"
                                    >
                                        Buy now
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
