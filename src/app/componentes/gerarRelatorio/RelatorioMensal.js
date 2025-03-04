'use client';

import React, { useContext, useRef } from 'react';
import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';

const RelatorioMensal = ({ MesRefrencia }) => {
	const tabelaRef = useRef();
	const { CarregarMes, conteudo, converterParaReal } =
		useContext(ComprovantesContext);

	return (
		<>
			<button onClick={() => CarregarMes('02')}>Carregar mes</button>
			<div className='dias-layout-impressao' ref={tabelaRef}>
				{conteudo &&
					Object?.keys(conteudo).map((ano, anoIndex) => {
						return (
							<div key={anoIndex}>
								{Object?.keys(conteudo[ano]).map((mes, mesIndex) => {
									return (
										<div key={mesIndex}>
											<div className='dias-layout-impressao-ano-mes'>
												Relatório {mes}/{ano}
											</div>
											{Object?.keys(conteudo[ano][mes]?.dias).map(
												(dia, diaIndex) => {
													return (
														<div key={diaIndex}>
															<div className='dias-layout-impressao-dia'>
																{dia}
															</div>
															<table className='tg dias-layout-impressao-tabela'>
																<thead>
																	<tr>
																		<th>Cartão</th>
																		<th>Responsável</th>
																		<th>Motivo</th>
																		<th>Valor</th>
																		<th>Arquivo</th>
																	</tr>
																</thead>
																<tbody>
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
																				<tr key={idComprovante + 1}>
																					<td className='tg-01'>
																						{cartaoComprovante || 'N/A'}
																					</td>
																					<td className='tg-02'>
																						{usuarioComprovante}
																					</td>
																					<td>{motivoComprovante}</td>
																					<td>
																						{converterParaReal(
																							valorComprovante
																						)}
																					</td>
																					<td>{linkComprovante}</td>
																				</tr>
																			);
																		}
																	)}
																</tbody>
															</table>
														</div>
													);
												}
											)}
										</div>
									);
								})}
							</div>
						);
					})}
			</div>
		</>
	);
};

export default RelatorioMensal;
