'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import Icon from '@mdi/react';
import {
	mdiCalendarBadge,
	mdiCalendarBadgeOutline,
	mdiCalendarFilter,
	mdiCalendarFilterOutline,
	mdiCurrentDc,
	mdiLinkVariant,
} from '@mdi/js';
import { Gfetch } from './Fetch/FetchGlobal';
import SelectThiago from './componentes/select/SelectThiago';
import Addbutton from './componentes/addbutton/Addbutton';
import EditButton from './componentes/editButton/EditButton';
import ComprovantesProvider, {
	ComprovantesContext,
} from './context/Comprovantes/ComprovantesContext';

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
		CarregarMes,
		conteudo,
		gastoCartoes,
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
	} = useContext(ComprovantesContext);

	const HeaderFunctions = ({ mes }) => {
		if (loadingHeaders) {
			return <div className='funcoes-header-loading loader'></div>;
		}

		let totalMes = totalMensal[ano];

		if (totalMes.hasOwnProperty(mes)) {
			return (
				<div className='funcoes-header-total'>
					R$
					<span className='span-color'>
						{converterParaReal(totalMensal[ano][mes], false)}
					</span>
				</div>
			);
		}
	};

	const Reduzir = (nome, limite) => {
		if (nome.length > limite) {
			return nome.substring(0, limite).trim() + '...';
		} else {
			return nome.trim();
		}
	};

	const TotalMesCartoes = ({ mesTotal, arrayBancos, mesReferencia }) => {
		if (mesTotal > 0 || arrayBancos.hasOwnProperty(mesReferencia)) {
			return (
				<div className='comprovantes-mes-total-mes'>
					<div className='comprovantes-mes-total-gasto-cartao'>
						<div className='comprovante-mes-total-cartao-bradesco'>
							<span>Bradesco</span>
							<br />
							{converterParaReal(gastoCartoes[mesReferencia]['Bradesco'])}
						</div>
						<div className='comprovante-mes-total-cartao-banestes'>
							<span>Banestes</span> <br />
							{converterParaReal(gastoCartoes[mesReferencia]['Banestes'])}
						</div>
						<div className='comprovante-mes-total-cartao-caixa'>
							<span>Caixa</span> <br />
							{converterParaReal(gastoCartoes[mesReferencia]['Caixa'])}
						</div>
					</div>
					<div className='comprovantes-mes-total-dados'>
						<div className='comprovantes-mes-total-completo'>
							<div>
								<Icon path={mdiCalendarBadgeOutline} size={1} />
							</div>
							<span className='span-color'>R$ </span>
							<div>
								{converterParaReal(totalMensal[ano][mesReferencia], false)}
							</div>
						</div>
						{totalMensal[ano][mesReferencia] !== mesTotal && (
							<div className='comprovantes-mes-total-filtrado'>
								<div>
									<Icon path={mdiCalendarFilterOutline} size={1} />
								</div>
								<span className='span-color'>R$ </span>
								<div>{converterParaReal(mesTotal, false)}</div>
							</div>
						)}
					</div>
				</div>
			);
		}
	};

	const LayoutMes = ({ MesNumerico, loading }) => {
		if (loading && MesAtivo.mes === MesNumerico) {
			return (
				<div className='comprovantes-loading'>
					Carregando &nbsp;&nbsp;&nbsp;<div className='loader'></div>
				</div>
			);
		}

		let conteudoAnoMes = conteudo?.[ano]?.[MesNumerico] || {};

		if (Object?.keys(conteudoAnoMes)?.length) {
			let conteudoDia = conteudoAnoMes?.dias;
			let valorFinalMes = 0;

			if (conteudoDia) {
				return (
					<div className='comprovantes-grupo'>
						<Busca ano={ano} mes={MesNumerico} />
						{conteudoDia.hasOwnProperty('na') ? (
							<div className='comprovantes-grupo-vazio'>
								{conteudoDia?.['na'].message}
							</div>
						) : (
							Object.keys(conteudoDia)
								?.sort()
								?.map((dia, ind) => {
									let valorTotalDia = 0;
									return (
										<div key={ind} className='comprovantes-mes'>
											<div className='comprovantes-mes-dia-header' key={ind}>
												{dia}
											</div>
											<div className='comprovantes-mes-dia-wrapper'>
												{Object?.values(conteudoDia?.[dia]).map(
													(ConteudoDia) => {
														let {
															idComprovante,
															motivoComprovante,
															usuarioComprovante,
															linkComprovante,
															valorComprovante,
														} = ConteudoDia;

														valorTotalDia =
															parseFloat(valorTotalDia) +
															parseFloat(valorComprovante || 0);
														valorFinalMes =
															parseFloat(valorFinalMes) +
															parseFloat(valorComprovante);
														return (
															<div
																key={idComprovante}
																className='comprovantes-dia'>
																<div className='comprovantes-dia-botoes'>
																	<a
																		href={`${Gfetch}/${linkComprovante}`}
																		alt={usuarioComprovante}
																		target='_blank'
																		rel='noopener noreferrer'>
																		<Icon path={mdiLinkVariant} size={1} />
																	</a>
																</div>
																<div className='comprovantes-dia-usuario'>
																	{usuarioComprovante}
																</div>
																<div
																	className='comprovantes-dia-motivo'
																	onClick={() =>
																		editarPostComprovante(idComprovante)
																	}>
																	<span>{motivoComprovante}</span>
																</div>

																<div className='comprovantes-dia-valor'>
																	{converterParaReal(valorComprovante)}
																</div>
															</div>
														);
													}
												)}
											</div>
											<div className='comprovantes-mes-total-dia'>
												<span className='span-color'>
													{converterParaReal(valorTotalDia)}
												</span>
											</div>
										</div>
									);
								})
						)}
						<TotalMesCartoes
							mesTotal={valorFinalMes}
							mesReferencia={MesNumerico}
							arrayBancos={gastoCartoes}
						/>
					</div>
				);
			} else {
				return (
					<div className='comprovantes-grupo comprovantes-vazio'>
						Nenhum comprovante.
					</div>
				);
			}
		}
	};

	return (
		<>
			<SelectThiago onAnoSelecionado={(e) => definirAno(e)} />
			<div className='comprovantes'>
				{meses.map(([NumMes, Mes]) => {
					return (
						<div key={NumMes} className='comprovantes-principal'>
							<div className='comprovantes-header'>
								<div className='header-mes'>{Mes}</div>
								<div className='funcoes-header'>
									<HeaderFunctions mes={NumMes} />
								</div>
								<div className='header-divisor'></div>
								<div className='buttons-header'>
									<BotaoOpen mesPosicaoNoObjeto={NumMes} />
								</div>
							</div>
							<LayoutMes MesNumerico={NumMes} loading={loading} />
						</div>
					);
				})}
			</div>
			<EditButton />
			<Addbutton onEnd={(mes) => CarregarMes(mes)} />
		</>
	);
}
