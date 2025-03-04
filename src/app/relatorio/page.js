import React from 'react';
import RelatorioMensal from '../componentes/gerarRelatorio/RelatorioMensal';
import ComprovantesProvider from '../context/Comprovantes/ComprovantesContext';

export default function page() {
	return (
		<ComprovantesProvider>
			<RelatorioMensal />
		</ComprovantesProvider>
	);
}
