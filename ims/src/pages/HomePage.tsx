import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 px-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Inventory System</h1>
      
      <button
        onClick={() => navigate('/login')}
        className="px-6 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition shadow-md"
      >
        Login / Register
      </button>
    </div>
  );
};

export default HomePage;
