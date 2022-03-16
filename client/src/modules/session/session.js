import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import axios from 'axios'
import { sessionState } from './session.state';

export default function Session({children}) {
    
  const setSession = useSetRecoilState(sessionState);

  useEffect(() => {
    async function updateSession() {
        try {
            const response = await axios.get('/api/session');
            setSession(response.data);
        } catch(error) {
            console.error(error);
            setSession({authenticated: false});
        }
    }
    updateSession();
  }, [setSession]);

  return children;
}