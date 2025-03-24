import React from 'react';
import Pdfmensal from '../componentes/gerarPdf/PdfMensal';
import ComprovantesProvider from '../context/Comprovantes/ComprovantesContext';
//import { PDFViewer } from '@react-pdf/renderer';

export default function page() {
	return (
		<ComprovantesProvider>
			<Pdfmensal />
		</ComprovantesProvider>
	);
}
