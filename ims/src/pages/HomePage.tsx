import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="text-center z-10"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight">
          Welcome to <span className="text-indigo-600">Assetly</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
          The smartest way to manage inventory at your <strong>Organization</strong>.
        </p>
        <p className="mt-2 text-md sm:text-lg text-gray-500 max-w-xl mx-auto italic">
          Track items. Manage requests. Simplify your workflow.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="mt-10 px-10 py-4 bg-indigo-600 text-white font-semibold rounded-2xl shadow-xl hover:bg-indigo-700 transition"
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HomePage;
