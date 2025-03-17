'use client';

import { LoginContext } from '@/app/context/login/LoginContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

export default function Menu() {
	const { user } = useContext(LoginContext);

	const pathname = usePathname();
	const isActive = (path) => path === pathname;

	const navg = [
		{
			id: 0,
			name: 'Comprovantes',
			ref: '/',
		},
		{
			id: 1,
			name: 'Login',
			ref: '/login',
		},
	];

	function BotaoTema() {
		const [tema, setTema] = useState('padrao'); // Estado inicial

		useEffect(() => {
			if (tema) {
				document.body.className = tema; // Aplica a classe ao body
			}
		}, [tema]);

		const alternarTema = () => {
			setTema(tema === 'padrao' ? 'tema-escuro' : 'padrao');
		};

		return (
			<button onClick={alternarTema}>
				Alternar para {tema === 'padrao' ? 'Tema Escuro' : 'Tema Claro'}
			</button>
		);
	}

	return (
		<nav className='menu'>
			<ul>
				{navg.map((link) => {
					return (
						<li key={link.id}>
							<Link
								href={link.ref}
								className={isActive(link.ref) ? 'liSelected' : null}>
								{link.name === 'Login' && user.username
									? user.username
									: link.name}
							</Link>
						</li>
					);
				})}
				{/* <li>
					<BotaoTema />
				</li> */}
			</ul>
		</nav>
	);
}
