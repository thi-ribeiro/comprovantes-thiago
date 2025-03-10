'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';

const RelatorioMensal = ({ AnoReferencia = '2025', MesRefrencia = '02' }) => {
	const [termoBusca, setTermoBusca] = useState('');
	const [dadosFiltrados, setDadosFiltrados] = useState(null); // Novo state para dados filtrados
	const [dadosContexto, setdadosContexto] = useState(null);

	const tabelaRef = useRef();
	const { CarregarMes, conteudo, converterParaReal, fileNamePop } =
		useContext(ComprovantesContext);

	useEffect(() => {
		setdadosContexto(conteudo);
	}, [conteudo]);

	const lidarComBusca = (evento) => {
		const termo = evento.target.value;
		setTermoBusca(termo);

		if (termo === '') {
			// Se a busca estiver vazia, restaura os dados originais
			setDadosFiltrados(null);
		} else {
			//console.log(dadosContexto['2025']['02']['dias']);

			let dados = dadosContexto[AnoReferencia][MesRefrencia]['dias'];
			let comprovantesFiltrados,
				resultadosFiltrados = [];

			for (const data in dados) {
				const comprovantesDoDia = dados[data];
				comprovantesFiltrados = comprovantesDoDia.filter((comprovante) =>
					comprovante.motivoComprovante
						.toLowerCase()
						.includes(termo.toLowerCase())
				);

				if (comprovantesFiltrados.length > 0) {
					//console.log(comprovantesFiltrados);
					resultadosFiltrados[data] = comprovantesFiltrados;
				}
			}

			setDadosFiltrados(resultadosFiltrados);
			console.log(resultadosFiltrados);
		}
	};

	return (
		<div className='relatorio'>
			<button onClick={() => CarregarMes('02')}>Carregar mes</button>

			<div className='relatorio-busca'>
				<input
					type='text'
					placeholder='Buscar motivo...'
					value={termoBusca}
					onChange={lidarComBusca}
				/>
			</div>
			<div className='dias-layout-impressao' ref={tabelaRef}>
				{dadosContexto &&
					Object?.keys(dadosContexto).map((ano, anoIndex) => {
						return (
							<div key={anoIndex}>
								{Object?.keys(dadosContexto[ano]).map((mes, mesIndex) => {
									return (
										<div key={mesIndex}>
											<table className='tg dias-layout-impressao-tabela'>
												<thead>
													<tr>
														<th colSpan='5'>
															Relatório {mes}/{ano}
														</th>
													</tr>
													<tr>
														<th>Cartão</th>
														<th>Responsável</th>
														<th>Motivo</th>
														<th>Valor</th>
														<th>Arquivo</th>
													</tr>
												</thead>
												{Object?.keys(
													dadosFiltrados
														? dadosFiltrados
														: dadosContexto[ano][mes]?.dias
												).map((dia, diaIndex) => {
													return (
														<tbody key={diaIndex}>
															<tr className='tr-dia'>
																<th colSpan='5'>{dia}</th>
															</tr>
															{dadosContexto[ano][mes]?.dias[dia].map(
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
																				{converterParaReal(valorComprovante)}
																			</td>
																			<td>{fileNamePop(linkComprovante)}</td>
																		</tr>
																	);
																}
															)}
														</tbody>
													);
												})}
											</table>
										</div>
									);
								})}
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default RelatorioMensal;
