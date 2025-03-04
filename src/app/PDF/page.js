import React from 'react';
import Pdfmensal from '../componentes/gerarPdf/PdfMensal';
import ComprovantesProvider from '../context/Comprovantes/ComprovantesContext';

export default function page() {
	return (
		<ComprovantesProvider>
			<Pdfmensal />
		</ComprovantesProvider>
	);
}
