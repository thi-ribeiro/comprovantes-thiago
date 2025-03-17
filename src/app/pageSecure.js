'use client';

import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import _ from 'lodash';

import { Gfetch } from './Fetch/FetchGlobal';
import SelectThiago from './componentes/select/SelectThiago';
import Addbutton from './componentes/addbutton/Addbutton';
import EditButton from './componentes/editButton/EditButton';
import ComprovantesProvider, {
	ComprovantesContext,
} from './context/Comprovantes/ComprovantesContext';
import {
	BsCalendar3,
	BsCalendarCheck,
	BsCalendarEvent,
	BsDot,
	BsLink45Deg,
} from 'react-icons/bs';

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
		dadosFiltrados,
	} = useContext(ComprovantesContext);

	const [alturaConteudo, setAlturaConteudo] = useState(0);
	const conteudoRef = useRef([]);

	useEffect(() => {
		// if (conteudoRef.current) {
		// 	console.log(conteudoRef.current.offsetHeight);
		// }
	}, [loading]);

	const HeaderFunctions = ({ mes }) => {
		if (loadingHeaders) {
			return <div className='funcoes-header-loading loader'></div>;
		}

		let totalMes = totalMensal[ano];

		//if (totalMes.hasOwnProperty(mes)) {
		return (
			<div className='funcoes-header-total'>
				R$
				<span className='span-color'>
					{converterParaReal(totalMensal[ano][mes], false)}
				</span>
			</div>
		);
		//}
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
						{Object?.keys(gastoCartoes[mesReferencia])?.map((cartao, index) => {
							let valorFinal = gastoCartoes[mesReferencia][cartao];

							return (
								<div key={index} className='comprovante-mes-total-cartao'>
									<div>
										<CorDoBanco banco={cartao} />
										<span>{cartao}</span>
										<CorDoBanco banco={cartao} />
									</div>
									<div>{converterParaReal(valorFinal)}</div>
								</div>
							);
						})}
					</div>

					<div className='comprovantes-mes-total-dados'>
						<div className='comprovantes-mes-total-completo'>
							<div>
								<BsCalendarCheck className='icons-react' />
							</div>
							<span className='span-color'>R$ </span>
							<div>
								{converterParaReal(totalMensal[ano][mesReferencia], false)}
							</div>
						</div>
						{converterParaReal(totalMensal[ano][mesReferencia], false) !==
						converterParaReal(mesTotal, false) ? (
							<div className='comprovantes-mes-total-filtrado'>
								<div>
									<BsCalendarEvent className='icons-react' />
								</div>
								<span className='span-color'>R$ </span>
								<div>{converterParaReal(mesTotal, false)}</div>
							</div>
						) : null}
					</div>
				</div>
			);
		}
	};

	const CorDoBanco = ({ banco }) => {
		//console.log('Banco:', banco);

		const cores = {
			Bradesco: '#ff0000',
			Banestes: '#79bce7',
			Caixa: '#0000ff',
		};

		const cor = cores[banco] || 'gray';
		return <BsDot className='icons-react' color={cor} />;
	};

	const LayoutMes = ({ MesNumerico, loading }) => {
		const [teste, setteste] = useState(100);

		const [isExpanded, setIsExpanded] = useState(false);

		useEffect(() => {
			if (conteudoRef.current && conteudoAnoMes && conteudoAnoMes.dias) {
				const height = conteudoRef.current.maxHeight;
				console.log(height);
				setIsExpanded(true);
			}
		}, []);

		const conteudoRef = useRef(null);

		if (loading && MesAtivo.mes === MesNumerico) {
			return (
				<div className='comprovantes-loading'>
					Carregando &nbsp;&nbsp;&nbsp;<div className='loader'></div>
				</div>
			);
		}

		let conteudoAno = conteudo?.[ano];
		let dadosFiltradosAno = dadosFiltrados?.[ano];

		let conteudoAnoMes = dadosFiltradosAno?.[MesNumerico]
			? dadosFiltradosAno?.[MesNumerico]
			: conteudoAno?.[MesNumerico];

		if (conteudoAno?.hasOwnProperty(MesNumerico)) {
			let valorFinalMes = 0;

			if (!conteudoAnoMes?.dias) {
				return (
					<div className='comprovantes-grupo comprovantes-vazio'>
						Nenhum comprovante.
					</div>
				);
			}

			//console.log(conteudoRef[MesNumerico]?.style.maxHeight);

			return (
				// <div
				// 	ref={conteudoRef}
				// 	className='comprovantes-grupo'
				// 	style={{
				// 		maxHeight: conteudoRef?.current
				// 			? `${conteudoRef.current.maxHeight}px`
				// 			: `${teste}px`,
				// 	}}>
				<div
					ref={conteudoRef}
					className={`comprovantes-grupo ${
						isExpanded ? 'expanded' : 'collapsed'
					}`}>
					<button
						onClick={() => {
							//setteste(2000);
							setIsExpanded(!isExpanded);
							console.log(conteudoRef?.current?.maxHeight);
						}}>
						TESTE
					</button>

					<Busca ano={ano} mes={MesNumerico} />
					{!Object?.keys(conteudoAnoMes?.dias).length ? (
						<div className='comprovantes-grupo-vazio'>
							Nenhum resultado para busca.
						</div>
					) : null}
					{Object?.keys(conteudoAnoMes?.dias)?.map((dia, index) => {
						let valorTotalDia = 0;

						return (
							<div key={index} className='comprovantes-mes'>
								<div className='comprovantes-mes-dia-header'>{dia}</div>
								<div className='comprovantes-mes-dia-wrapper'>
									{Object?.values(conteudoAnoMes?.dias[dia])?.map(
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
															<BsLink45Deg className='icons-react' />
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
														<CorDoBanco banco={cartaoComprovante} />
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
					})}
					<TotalMesCartoes
						mesTotal={valorFinalMes}
						mesReferencia={MesNumerico}
						arrayBancos={gastoCartoes}
					/>
				</div>
			);
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
								<div className='header-mes'>
									<div className='icon'>
										<BsCalendar3 className='icons-react' />
									</div>
									<div className='mes'>{Mes}</div>
								</div>
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
