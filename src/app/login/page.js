'use client';

import React, { useContext } from 'react';
import { LoginContext } from '../context/login/LoginContext';
import { Gfetch } from '../Fetch/FetchGlobal';

export default function Login() {
	const { clearUserLocal, setToken } = useContext(LoginContext);

	const loginf = async (e) => {
		e.preventDefault();

		clearUserLocal();
		const formData = new FormData(e.currentTarget);

		const username = formData.get('username');
		const password = formData.get('password');

		const response = await fetch(`${Gfetch}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		});

		const data = await response.json();

		if (response.status === 200) {
			setToken(data, data.usuario, data.usuarioid);
			window.location.href = '/';
		} else {
			clearUserLocal();
		}
	};

	return (
		<div className='login'>
			<h1>Login</h1>
			<form onSubmit={(e) => loginf(e)}>
				<input type='text' name='username' placeholder='Usuário' required />
				<input type='password' name='password' placeholder='Senha' required />
				<div className='funcoes_form'>
					<input type='submit' value='login' />
				</div>
			</form>
		</div>
	);
}
