import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface SessionContextType {
	userId: string | null;
	userName: string | null;
	token: string | null;
	loading: boolean;
	setToken: (token: string | null) => void;
	refreshToken: string | null;
}

const SessionContext = createContext<SessionContextType>({
	userId: null,
	userName: null,
	token: null,
	loading: true,
	setToken: () => {},
	refreshToken: null,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status } = useSession();
	const [userId, setUserId] = useState<string>('');
	const [token, setToken] = useState<string>('');
	const [refreshToken, setRefreshToken] = useState<string>('');
	const [userName, setUserName] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (status === 'authenticated' && session?.user) {
			setUserId(session.user.userId || '');
			setToken(session.user.token || '');
			setRefreshToken(session.user.refreshToken || '');
			setUserName(session.user.userName || '');
		}

		setLoading(status === 'loading');
	}, [session, status]);

	const contextValue = useMemo(() => ({ userId, userName, token, refreshToken, loading, setToken }), [userId, userName, token, refreshToken, loading]);

	return (
		<SessionContext.Provider value={contextValue}>
			{children}
		</SessionContext.Provider>
	);
};

export const useSessionContext = () => useContext(SessionContext);
