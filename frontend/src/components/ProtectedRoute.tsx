import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ProtectedRoute({ children, role }: { children: JSX.Element, role?: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await api.get('/auth/verify');
        if (role && response.data.user.role !== role) {
          navigate('/unauthorized');
        }
      } catch (err) {
        navigate('/login');
      }
    };
    
    verifyAuth();
  }, [navigate, role]);

  return children;
}
