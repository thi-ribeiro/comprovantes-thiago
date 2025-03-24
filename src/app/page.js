'use client';

import React, { useContext, useMemo, useRef, useState } from 'react';
import _ from 'lodash';

import { Gfetch } from './Fetch/FetchGlobal';
import SelectThiago from './componentes/select/SelectThiago';
import Addbutton from './componentes/addbutton/Addbutton';
import EditButton from './componentes/editButton/EditButton';
import ComprovantesProvider, {
	ComprovantesContext,
} from './context/Comprovantes/ComprovantesContext';
import { BsCalendar, BsLink45Deg } from 'react-icons/bs';
import AnimatedItem from './componentes/animated/AnimatedItem';
import TotalCartoes from './componentes/cartoes/TotalCartoes';

export default function Page() {
	return (
		<ComprovantesProvider>
			<Conteudo />
		</ComprovantesProvider>
	);
}

function Conteudo() {
	const [meses, setMeses] = useState(
		Object.entries({
			'01': 'Janeiro',
			'02': 'Fevereiro',
			'03': 'Março',
			'04': 'Abril',
			'05': 'Maio',
			'06': 'Junho',
			'07': 'Julho',
			'08': 'Agosto',
			'09': 'Setembro',
			10: 'Outubro',
			11: 'Novembro',
			12: 'Dezembro',
		}).sort()
	);

	const {
		conteudo,
		definirAno,
		BotaoOpen,
		loading,
		MesAtivo,
		editarPostComprovante,
		ano,
		converterParaReal,
		Busca,
		totalMensal,
		loadingHeaders,
		CorDoBanco,
	} = useContext(ComprovantesContext);

	const refMudar = useRef(null);

	const HeaderFunctions = ({ Mes }) => {
		let total = totalMensal?.[ano]?.[Mes];
		return (
			<div className='funcoes-header-total'>
				{loadingHeaders ? (
					<div className='funcoes-header-loading loader'></div>
				) : (
					<>
						R$
						<span className='span-color'>
							{converterParaReal(total, false)}
						</span>
					</>
				)}
			</div>
		);
	};

	const LayoutMes = ({ Mes, Loading, Conteudo }) => {
		if (Loading && MesAtivo.mes === Mes) {
			return (
				<div className='comprovantes-loading'>
					Carregando &nbsp;&nbsp;&nbsp;<div className='loader'></div>
				</div>
			);
		}

		if (Conteudo) {
			let valorFinalMes = 0;

			if (!Conteudo?.dias) {
				return (
					<div className='comprovantes-grupo comprovantes-vazio' ref={refMudar}>
						Nenhum comprovante.
					</div>
				);
			}
			return (
				<div className='comprovantes-grupo' ref={refMudar}>
					<Busca ano={ano} mes={Mes} />
					{!Object?.keys(Conteudo?.dias).length ? (
						<div className='comprovantes-grupo-vazio'>
							Nenhum resultado para busca.
						</div>
					) : null}
					{Object?.keys(Conteudo?.dias)
						.sort() //FIX SORT TESTANDO
						?.map((dia, index) => {
							let valorTotalDia = 0;

							return (
								<div key={index} className='comprovantes-mes'>
									<div className='comprovantes-mes-dia-header'>{dia}</div>
									<div className='comprovantes-mes-dia-wrapper'>
										{Object?.values(Conteudo?.dias[dia])?.map(
											(conteudoDia, indexConteudo) => {
												let {
													idComprovante,
													motivoComprovante,
													usuarioComprovante,
													linkComprovante,
													valorComprovante,
													cartaoComprovante,
												} = conteudoDia;

												valorTotalDia =
													parseFloat(valorTotalDia) +
													parseFloat(valorComprovante || 0);
												// valorFinalMes =
												// 	parseFloat(valorFinalMes) +
												// 	parseFloat(valorComprovante);
												return (
													<div key={idComprovante} className='comprovantes-dia'>
														<div className='comprovantes-dia-botoes'>
															<a
																href={`${Gfetch}/${linkComprovante}`}
																alt={usuarioComprovante}
																target='_blank'
																rel='noopener noreferrer'>
																<BsLink45Deg className='icons-react' />
															</a>
														</div>
														<div className='comprovantes-dia-usuario'>
															{usuarioComprovante}
														</div>
														<div
															className='comprovantes-dia-motivo'
															onClick={() =>
																editarPostComprovante(idComprovante, Mes)
															}>
															<span>{motivoComprovante}</span>
														</div>

														<div className='comprovantes-dia-valor'>
															<CorDoBanco banco={cartaoComprovante} />
															{converterParaReal(valorComprovante)}
														</div>
													</div>
												);
											}
										)}
									</div>

									<div className='comprovantes-mes-dia-total'>
										<span className='span-color'>
											{converterParaReal(valorTotalDia)}
										</span>
									</div>
								</div>
							);
						})}
					<TotalCartoes mes={Mes} ano={ano} />
				</div>
			);
		}
	};

	return (
		<>
			<SelectThiago onAnoSelecionado={(e) => definirAno(e)} />
			<div className='comprovantes'>
				{meses.map(([NumMes, Mes]) => {
					let conteudoAno = conteudo?.[ano];
					let conteudoAnoMes = conteudoAno?.[NumMes];

					return (
						<div key={NumMes} className='comprovantes-principal'>
							<div className='comprovantes-header'>
								<div className='header-mes'>
									<div className='icon'>
										<BsCalendar className='icons-react' />
									</div>
									<div className='mes'>{Mes}</div>
								</div>
								<div className='funcoes-header'>
									<HeaderFunctions Mes={NumMes} />
								</div>
								<div className='header-divisor'></div>
								<div className='buttons-header'>
									<BotaoOpen mesPosicaoNoObjeto={NumMes} />
								</div>
							</div>
							<AnimatedItem
								isActive={conteudoAno?.hasOwnProperty(NumMes)}
								refComponente={refMudar}>
								<LayoutMes
									Mes={NumMes}
									Loading={loading}
									Conteudo={conteudoAnoMes}
								/>
							</AnimatedItem>
						</div>
					);
				})}
			</div>

			<EditButton />
			<Addbutton />
		</>
	);
}
