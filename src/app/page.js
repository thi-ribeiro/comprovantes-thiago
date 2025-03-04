'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import Icon from '@mdi/react';
import {
	mdiEyeOffOutline,
	mdiEyeOutline,
	mdiLink,
	mdiLinkVariant,
} from '@mdi/js';
import { Gfetch } from './Fetch/FetchGlobal';
import SelectThiago from './componentes/select/SelectThiago';
import Addbutton from './componentes/addbutton/Addbutton';
import EditButton from './componentes/editButton/EditButton';

import { LoginContext } from './context/login/LoginContext';
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
	const [loadingHeaders, setLoadingHeaders] = useState(true); //A IDEIA ERA COMEÇAR JÁ RODANDO LOADING
	const [userVis, setUservis] = useState({});
	const [totalMensal, settotalMensal] = useState([]);

	const { checkTokenNoFetch } = useContext(LoginContext);
	const {
		CarregarMes,
		conteudo,
		gastoCartoes,
		definirAno,
		IconButton,
		loading,
		MesAtivo,
		editarPostComprovante,
		ano,
		converterParaReal,
	} = useContext(ComprovantesContext);

	const eventSourcesRef = useRef({
		eventVisualizacao: null,
		eventSomatoriaMes: null,
	});

	useEffect(() => {
		checkTokenNoFetch();

		const currentEventSources = eventSourcesRef.current;

		if (currentEventSources) {
			currentEventSources.eventVisualizacao?.close();
			currentEventSources.eventSomatoriaMes?.close();
		}

		const eventVisualizacao = new EventSource(`${Gfetch}/stream/eyeactive`);
		eventVisualizacao.onmessage = (event) => {
			const dadosObj = JSON.parse(event.data);
			const atualizar = dadosObj
				.filter((item) => {
					return item.lastviewcomprovante.split('-')[0] === ano.toString();
				})
				.map((item) => {
					return {
						...item,
						lastviewcomprovante: item.lastviewcomprovante.split('-')[1],
					};
				});
			let agrupar = _.groupBy(atualizar, 'lastviewcomprovante');

			setLoadingHeaders(false); //FINALIZAR O LOADING
			setUservis(agrupar);
		};

		const eventSomatoriaMes = new EventSource(`${Gfetch}/somaMeses`);
		eventSomatoriaMes.onmessage = (event) => {
			const dados = JSON.parse(event.data);
			const dadosAno = dados.filter((item) => {
				return item.ano.split('-')[0] === ano.toString();
			});

			setLoadingHeaders(false);
			settotalMensal(dadosAno);
		};

		eventVisualizacao.onerror = (error) => {
			console.error('Erro no EventSource:', error);
			eventVisualizacao.close(); // Feche a conexão em caso de erro
		};

		eventSourcesRef.current = { eventVisualizacao, eventSomatoriaMes };

		return () => {
			eventVisualizacao.close();
			eventSomatoriaMes.close();
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ano]);

	const HeaderFunctions = ({ mes }) => {
		if (loadingHeaders) {
			return <div className='funcoes-header-loading loader'></div>;
		}

		const usuariosDoMes = userVis[mes]?.map((i) => i.username).join(', ');
		const valorTotalMes = totalMensal
			?.filter((i) => i.mes === mes)
			//.map((i) => i.totalMes.toFixed(2).replace('.', ','))[0];
			.map((i) => converterParaReal(i.totalMes))[0];
		return (
			<>
				{valorTotalMes && (
					<div className='funcoes-header-total'>
						{/* R$ &nbsp; */}
						<span className='span-color'>{valorTotalMes}</span>
					</div>
				)}

				<div className='funcoes-header-usuarios' alt={usuariosDoMes}>
					{!usuariosDoMes ? (
						<Icon className='hiddenEye' path={mdiEyeOffOutline} size={1} />
					) : (
						<Icon path={mdiEyeOutline} size={1} />
					)}
				</div>
			</>
		);
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
					<div className='comprovantes-mes-total'>
						Total &nbsp;
						<span className='span-color'>{converterParaReal(mesTotal)}</span>
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

		let conteudoAnoMes = conteudo[ano]?.[MesNumerico];

		if (conteudoAnoMes && conteudoAnoMes?.active) {
			let conteudoDia = conteudoAnoMes?.dias;
			let valorFinalMes = 0;
			if (conteudoDia) {
				return (
					<div className='comprovantes-grupo'>
						{Object.keys(conteudoDia)
							.sort()
							.map((dia, ind) => {
								let valorTotalDia = 0;
								return (
									<div key={ind} className='comprovantes-mes'>
										<div className='comprovantes-mes-dia-header' key={ind}>
											{dia}
										</div>
										{conteudoDia[dia].map((ConteudoDia) => {
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
												<div key={idComprovante} className='comprovantes-dia'>
													<div className='comprovantes-dia-botoes'>
														<a
															href={`${Gfetch}/${linkComprovante}`}
															alt={usuarioComprovante}
															target='_blank'
															rel='noopener noreferrer'>
															<Icon path={mdiLinkVariant} size={0.8} />
														</a>
													</div>
													<div className='comprovantes-dia-usuario'>
														{Reduzir(usuarioComprovante, 8)}
													</div>
													<div
														className='comprovantes-dia-motivo'
														onClick={() =>
															editarPostComprovante(idComprovante)
														}>
														<span>{Reduzir(motivoComprovante, 25)}</span>
													</div>

													<div className='comprovantes-dia-valor'>
														{converterParaReal(valorComprovante)}
													</div>
												</div>
											);
										})}

										<div className='comprovantes-mes-total-dia'>
											<span className='span-color'>
												{converterParaReal(valorTotalDia)}
											</span>
										</div>
									</div>
								);
							})}
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
									<IconButton mesPosicaoNoObjeto={NumMes} />
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
