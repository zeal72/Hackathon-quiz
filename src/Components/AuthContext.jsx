// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../Firebase.config';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Firebase calls this whenever auth state changes (including on page load)
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

// Hook to access auth state
export function useAuth() {
	return useContext(AuthContext);
}
