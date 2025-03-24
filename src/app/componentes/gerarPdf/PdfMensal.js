'use client';

import React, { useContext, useRef } from 'react';
import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';
import {
	Document,
	PDFViewer,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';

const PdfMensal = ({ MesRefrencia }) => {
	const tabelaRef = useRef();
	const { CarregarMes, conteudo, fileNamePop, converterParaReal } =
		useContext(ComprovantesContext);

	const styles = StyleSheet.create({
		page: {
			display: 'flex',
			flexDirection: 'column',
			backgroundColor: '#FFF',
			fontSize: 12,
			fontWeight: 'bold',
		},
		cabecalho: { display: 'flex', flexDirection: 'row' },
		section: {
			display: 'flex',
			margin: 10,
			padding: 10,
			flexGrow: 1,
		},
		headerMesAno: {
			margin: 5,
		},
		diaHeader: { marginBottom: 2, marginLeft: 5 },
		tabela: {
			display: 'flex',
		},
		table: {
			display: 'table',
			width: 'auto',
			borderStyle: 'solid',
			borderWidth: 1,
			borderRightWidth: 0,
			borderBottomWidth: 0,
			marginBottom: 5,
			marginLeft: 5,
			marginRight: 5,
		},
		tableRow: {
			margin: 'auto',
			flexDirection: 'row',
		},
		tableColHeader: {
			width: '20%',
			height: 'auto',
			borderStyle: 'solid',
			borderWidth: 1,
			borderLeftWidth: 0,
			borderTopWidth: 0,
			backgroundColor: '#f0f0f0', // Cor de fundo para o cabeçalho
		},
		tableCol: {
			width: '20%',
			borderStyle: 'solid',
			borderWidth: 1,
			borderLeftWidth: 0,
			borderTopWidth: 0,
		},
		tableCellHeader: {
			margin: 'auto',
			//marginTop: 5,
			fontSize: 10,
			fontWeight: 'bold', // Negrito para o cabeçalho
		},
		tableCell: {
			margin: 'auto',
			fontWeight: 'normal',
			//marginTop: 5,
			fontSize: 9,
		},
		cartaoCol: {
			width: '10%', // Largura reduzida para Cartão
		},
		responsavelCol: {
			width: '15%', // Largura reduzida para Responsável
		},
		valorCol: {
			width: '10%', // Largura reduzida para Valor
		},
		motivoCol: {
			width: '20%', // Largura para Motivo
		},
		arquivoCol: {
			width: '45%', // Largura para Arquivo
		},
	});

	return (
		<>
			<div className='relatorio'>
				<button onClick={() => CarregarMes('02')}>Carregar mes</button>
				<div className='dias-layout-impressao' ref={tabelaRef}>
					{conteudo &&
						Object?.keys(conteudo).map((ano, anoIndex) => {
							return (
								<>
									{Object?.keys(conteudo[ano]).map((mes, mesIndex) => {
										return (
											<>
												<div className='dias-layout-impressao-ano-mes'>
													Relatório {mes}/{ano}
												</div>
												<table className='tg dias-layout-impressao-tabela'>
													<thead>
														<tr>
															<th className='th1'>Cartão</th>
															<th className='th2'>Responsável</th>
															<th className='th3'>Motivo</th>
															<th className='th4'>Valor</th>
															<th className='th5'>Arquivo</th>
														</tr>
													</thead>

													{Object?.keys(conteudo[ano][mes]?.dias).map(
														(dia, diaIndex) => {
															return (
																<tbody key={diaIndex}>
																	<td
																		colSpan={5}
																		className='dias-layout-impressao-dia'>
																		{dia}
																	</td>

																	{conteudo[ano][mes]?.dias[dia].map(
																		(diaContent, contentIndex) => {
																			let {
																				idComprovante,
																				motivoComprovante,
																				usuarioComprovante,
																				linkComprovante,
																				valorComprovante,
																				cartaoComprovante,
																			} = diaContent;
																			return (
																				<tr key={idComprovante}>
																					<td className='tg-01'>
																						{cartaoComprovante || 'N/A'}
																					</td>
																					<td className='tg-02'>
																						{usuarioComprovante}
																					</td>
																					<td className='tg-0lax'>
																						{motivoComprovante}
																					</td>
																					<td className='tg-0lax'>
																						{converterParaReal(
																							valorComprovante
																						)}
																					</td>
																					<td className='tg-0lax'>
																						{linkComprovante}
																					</td>
																				</tr>
																			);
																		}
																	)}
																</tbody>
															);
														}
													)}
												</table>
											</>
										);
									})}
								</>
							);
						})}
				</div>
			</div>

			{conteudo && false && (
				<PDFViewer style={{ width: '100vh', height: '100vh' }}>
					<Document>
						<Page size='A4' style={styles.page}>
							<View style={styles.cabecalho}>
								<View style={styles.section}>
									<Text>Relatório MES ANO!</Text>
								</View>
								<View style={styles.section}>
									<Text>Section #2</Text>
								</View>
							</View>
							<View style={styles.tabela}>
								{Object?.keys(conteudo).map((ano, anoIndex) => {
									return (
										<>
											{Object?.keys(conteudo[ano]).map((mes, mesIndex) => {
												return (
													<>
														<Text key={mesIndex} style={styles.headerMesAno}>
															Relatório {mes}/{ano}
														</Text>
														{Object?.keys(conteudo[ano][mes]?.dias).map(
															(dia, diaIndex) => {
																return (
																	<>
																		<Text style={styles.diaHeader}>{dia}</Text>
																		<View key={diaIndex} style={styles.table}>
																			<View style={styles.tableRow}>
																				<View
																					style={{
																						...styles.tableColHeader,
																						...styles.cartaoCol,
																					}}>
																					<Text style={styles.tableCellHeader}>
																						Cartão
																					</Text>
																				</View>
																				<View
																					style={{
																						...styles.tableColHeader,
																						...styles.responsavelCol,
																					}}>
																					<Text style={styles.tableCellHeader}>
																						Responsável
																					</Text>
																				</View>
																				<View
																					style={{
																						...styles.tableColHeader,
																						...styles.motivoCol,
																					}}>
																					<Text style={styles.tableCellHeader}>
																						Motivo
																					</Text>
																				</View>
																				<View
																					style={{
																						...styles.tableColHeader,
																						...styles.valorCol,
																					}}>
																					<Text style={styles.tableCellHeader}>
																						Valor
																					</Text>
																				</View>
																				<View
																					style={{
																						...styles.tableColHeader,
																						...styles.arquivoCol,
																					}}>
																					<Text style={styles.tableCellHeader}>
																						Arquivo
																					</Text>
																				</View>
																			</View>
																			{conteudo[ano][mes]?.dias[dia].map(
																				(diaContent, contentIndex) => {
																					let {
																						idComprovante,
																						motivoComprovante,
																						usuarioComprovante,
																						linkComprovante,
																						valorComprovante,
																						cartaoComprovante,
																					} = diaContent;
																					return (
																						<View
																							style={styles.tableRow}
																							key={contentIndex}>
																							<View
																								style={{
																									...styles.tableCol,
																									...styles.cartaoCol,
																								}}>
																								<Text style={styles.tableCell}>
																									{cartaoComprovante}
																								</Text>
																							</View>
																							<View
																								style={{
																									...styles.tableCol,
																									...styles.responsavelCol,
																								}}>
																								<Text style={styles.tableCell}>
																									{usuarioComprovante}
																								</Text>
																							</View>
																							<View
																								style={{
																									...styles.tableCol,
																									...styles.motivoCol,
																								}}>
																								<Text style={styles.tableCell}>
																									{motivoComprovante}
																								</Text>
																							</View>
																							<View
																								style={{
																									...styles.tableCol,
																									...styles.valorCol,
																								}}>
																								<Text style={styles.tableCell}>
																									{converterParaReal(
																										valorComprovante
																									)}
																								</Text>
																							</View>
																							<View
																								style={{
																									...styles.tableCol,
																									...styles.arquivoCol,
																								}}>
																								<Text style={styles.tableCell}>
																									{linkComprovante}
																								</Text>
																							</View>
																						</View>
																					);
																				}
																			)}
																		</View>
																	</>
																);
															}
														)}
													</>
												);
											})}
										</>
									);
								})}
							</View>
						</Page>
					</Document>
				</PDFViewer>
			)}
		</>
	);
};

export default PdfMensal;
