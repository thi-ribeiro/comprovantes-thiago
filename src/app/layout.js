import '../Styles/comprovantes.css';
import Menu from './componentes/menu/Menu';
import { Inter } from 'next/font/google';
import LoginProvider from './context/login/LoginContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Comprovantes',
	description: 'Gerenciamento de comprovantes - Thiago',
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<LoginProvider>
					<Menu />
					{children}
				</LoginProvider>
			</body>
		</html>
	);
}
