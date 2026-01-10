import { Link } from 'react-router-dom';
import { FiHeart, FiUsers, FiShield, FiArrowRight, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiHeart className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">NGO Donation Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <Link 
                to="/login" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Make a <span className="text-primary-600 dark:text-primary-400">Difference</span> Today
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Join our community of donors and volunteers. Your contribution helps us create 
            positive change in communities around the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg"
            >
              <span>Get Started</span>
              <FiArrowRight />
            </Link>
            <Link 
              to="/login" 
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-semibold text-lg border border-gray-200 dark:border-gray-700 transition-all"
            >
              <span>Already a member? Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg card-hover">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
              <FiUsers className="text-blue-600 dark:text-blue-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Register</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create your account to join our community. Your registration data is securely stored 
              and helps us stay connected with our supporters.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg card-hover">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
              <FiHeart className="text-green-600 dark:text-green-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Donate</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Make secure donations of any amount. Track your donation history and receive 
              receipts for all successful contributions.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg card-hover">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
              <FiShield className="text-purple-600 dark:text-purple-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Track Impact</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View your complete donation history, track payment statuses, and see how your 
              contributions are making a difference.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">1000+</p>
              <p className="text-primary-100">Registered Users</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">₹50L+</p>
              <p className="text-primary-100">Total Donations</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">100+</p>
              <p className="text-primary-100">Campaigns</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">50+</p>
              <p className="text-primary-100">Communities Helped</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Make a Change?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are already making a positive impact. 
            Register today and start your journey of giving.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center space-x-2 bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            <span>Register Now</span>
            <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiHeart className="text-white" />
              </div>
              <span className="text-white font-bold">NGO Donation Portal</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} NGO Donation Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
