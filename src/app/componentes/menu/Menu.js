'use client';

import { LoginContext } from '@/app/context/login/LoginContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useContext } from 'react';

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
			</ul>
		</nav>
	);
}
