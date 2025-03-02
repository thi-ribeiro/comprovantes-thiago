'use client';

import { Gfetch } from '@/app/Fetch/FetchGlobal';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useState, useEffect } from 'react';

export const LoginContext = createContext(null);

function LoginProvider({ children }) {
	const [user, setUser] = useState({});
	const [token, settoken] = useState({});

	useEffect(() => {
		const storedUser = localStorage?.getItem('usuario');
		const storedId = localStorage?.getItem('id');

		if (storedUser && storedId) {
			setUser({ username: storedUser, userid: storedId });
		}
	}, []);

	const clearUserLocal = () => {
		localStorage?.removeItem('usuario');
		localStorage?.removeItem('token');
		localStorage?.removeItem('id');
		setUser({ username: 'Login' });
	};

	const setToken = (token, user, userid) => {
		localStorage?.setItem('token', token.token);
		localStorage?.setItem('usuario', user);
		localStorage?.setItem('id', userid);
		setUser({ username: user, userid: userid });
	};

	const verificaToken = async () => {
		const token = localStorage?.getItem('token');

		if (token) {
			const response = await fetch(`${Gfetch}/api/verifyToken`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();

			//console.log(data);
			if (response.status === 401) {
				clearUserLocal();
				window.location.href = '/login';
				return;
			} else {
				return false; //RETORNA FALSE POSSO USAR AWAIT PARA VERIFICAR O LOAD!
			}
		} else {
			clearUserLocal();
			window.location.href = '/login';
		}
	};

	const checkTokenNoFetch = () => {
		let token = localStorage?.getItem('token');

		if (!token) window.location.href = '/login';
		if (typeof window !== 'undefined') {
			const decodedToken = jwtDecode(token);

			if (decodedToken.exp < Date.now() / 1000) {
				clearUserLocal();
				window.location.href = '/login';
			}
		}
	};

	return (
		<LoginContext.Provider
			value={{
				user,
				setUser,
				clearUserLocal,
				setToken,
				verificaToken,
				checkTokenNoFetch,
			}}>
			{children}
		</LoginContext.Provider>
	);
}

export default LoginProvider;
