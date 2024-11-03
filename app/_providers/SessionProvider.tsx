import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface SessionContextType {
  userId: string | null;
  userName: string | null;
  token: string | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  userId: null,
  userName: null,
  token: null,
  loading: true,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUserId(session.user.userId);
      setToken(session.user.token);
      setUserName(session.user.userName);
    }

    setLoading(status === 'loading');
  }, [session, status]);

  const contextValue = useMemo(() => ({ userId, userName, token, loading }), [userId, userName, token, loading]);

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => useContext(SessionContext);
