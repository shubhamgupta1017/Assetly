import React, { useState } from 'react';
const VITE_BACKEND= 'http://localhost:3000'; // Replace with your backend URL
const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [entryNumber, setEntryNumber] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    window.location.href = `${VITE_BACKEND}/auth/google`;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(contactNumber)) {
      setError('Contact number must be exactly 10 digits.');
      return;
    }

    if (entryNumber.length !== 11) {
      setError('Entry number must be exactly 11 characters.');
      return;
    }

    const params = new URLSearchParams({
      contactNumber,
      entryNumber,
    });

    window.location.href = `${VITE_BACKEND}/auth/google?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-purple-400">
        <h1 className="text-3xl font-extrabold text-center text-purple-600 mb-6">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h1>

        {isRegistering ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter 10-digit number"
                className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-300 outline-none text-gray-700"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Entry Number</label>
              <input
                type="text"
                value={entryNumber}
                onChange={(e) => setEntryNumber(e.target.value)}
                placeholder="Enter entry number"
                className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-300 outline-none text-gray-700"
                maxLength={11}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl font-semibold shadow-lg transition"
            >
              Continue with Google
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-semibold shadow-lg transition"
            >
              Sign in with Google
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setContactNumber('');
              setEntryNumber('');
            }}
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
