// components/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verify } from '../utils/verify';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runVerify = async () => {
      try {
        await verify(); // assumes throws on failure
        setLoading(false);
      } catch {
        navigate('/');
      }
    };

    runVerify();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center text-gray-600">Verifying...</div>;

  return <>{children}</>;
};

export default AuthGuard;
