'use client';

import React, { useContext, useRef } from 'react';
import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';

const PdfMensal = ({ MesRefrencia }) => {
	const tabelaRef = useRef();
	const { CarregarMes, conteudo } = useContext(ComprovantesContext);

	return (
		<>
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
											{Object?.keys(conteudo[ano][mes]?.dias).map(
												(dia, diaIndex) => {
													return (
														<>
															<div className='dias-layout-impressao-dia'>
																{dia}
															</div>
															<table className='tg dias-layout-impressao-tabela'>
																<thead>
																	<tr>
																		<th className='tg-0pky'>Cartão</th>
																		<th className='tg-0pky'>Responsável</th>
																		<th className='tg-0pky'>Motivo</th>
																		<th className='tg-0pky'>Valor</th>
																		<th className='tg-0pky'>Arquivo</th>
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
																						R${' '}
																						{valorComprovante
																							? parseFloat(
																									valorComprovante
																							  ).toLocaleString('pt-BR', {
																									style: 'currency',
																									currency: 'BRL',
																							  })
																							: 'R$ 0,00'}
																					</td>
																					<td className='tg-0lax'>
																						{linkComprovante}
																					</td>
																				</tr>
																			);
																		}
																	)}
																</tbody>
															</table>
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
			</div>
		</>
	);
};

export default PdfMensal;
