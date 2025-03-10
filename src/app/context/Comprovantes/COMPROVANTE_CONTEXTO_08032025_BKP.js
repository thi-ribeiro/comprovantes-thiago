'use client';

import { Gfetch } from '@/app/Fetch/FetchGlobal';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../login/LoginContext';
import _ from 'lodash';
import Icon from '@mdi/react';
import {
	mdiTextSearchVariant,
	mdiUnfoldLessHorizontal,
	mdiUnfoldMoreHorizontal,
} from '@mdi/js';

export const ComprovantesContext = createContext();

function ComprovantesProvider({ children }) {
	const [ano, setAno] = useState(new Date().getFullYear()); //ANO PADRAO ATUAL
	const [conteudo, setConteudo] = useState({});
	const [loading, setLoading] = useState(false);
	const [loadingFunctions, setLoadingFunctions] = useState(true); //A IDEIA ERA COMEÇAR JÁ RODANDO LOADING
	const [loadingHeaders, setLoadingHeaders] = useState(true); //A IDEIA ERA COMEÇAR JÁ RODANDO LOADING
	const [MesAtivo, setMesAtivo] = useState({});
	const [gastoCartoes, setgastoCartoes] = useState({});
	const [handleDadosForm, sethandleDadosForm] = useState({});
	const [editando, setEditando] = useState(null);
	const [idEditando, setidEditando] = useState(null);
	const [dadosFiltrados, setDadosFiltrados] = useState(null);
	const [totalMensal, settotalMensal] = useState([]);

	const { user } = useContext(LoginContext);

	useEffect(() => {
		const eventSomatoriaMes = new EventSource(`${Gfetch}/somaMeses`);

		eventSomatoriaMes.onmessage = (event) => {
			const dados = JSON.parse(event.data);
			const dadosAno = dados.filter((item) => {
				return item.ano.split('-')[0] === ano.toString();
			});

			if (!_.isEqual(dadosAno, totalMensal)) {
				setLoadingHeaders(false);
				settotalMensal(dadosAno);
			}
		};

		return () => {
			eventSomatoriaMes.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const CarregarMes = async (mes) => {
		//let user = localStorage.getItem('usuario');
		setLoading(true);
		setDadosFiltrados(null); //APAGA A BUSCA ATUAL

		let token = localStorage?.getItem('token');
		//setMesAtivo({ ...MesAtivo, [mes]: mes }); //SETA O MES ASSIM QUE CLICAR PARA CARREGAR
		setMesAtivo({ mes: mes }); //SETA O MES ASSIM QUE CLICAR PARA CARREGAR
		//SEM ESTE MES ATIVO EU NAO CONSIGO PEGAR O MES QUE VAI RECEBER LOADING

		let optionsFetch = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				anoReferencia: ano,
				mesReferencia: mes,
				userId: user.userid,
			}),
		};

		const response = await fetch(
			`${Gfetch}/data/comprovantes/especifico`,
			optionsFetch
		);
		//TRATATIVA PARA ATIVAR OU DESATIVAR O MES ESPECIFICO

		const respostaComprovantes = await response.json();

		if (respostaComprovantes.tokenStatus === false) {
			window.location.href = '/login';
			return;
		}

		let groupedByDay, groupedbybank;
		let somaDosBancos = {};

		if (respostaComprovantes.length) {
			const groupedByMonth = _.groupBy(
				respostaComprovantes,
				(item) => item.mesReferencia
			);

			groupedByDay = _.groupBy(
				groupedByMonth[mes],
				(item) => item.diaReferencia
			);

			groupedbybank = _.groupBy(groupedByMonth[mes], 'cartaoComprovante');
			delete groupedbybank.null;

			//console.log(groupedbybank);

			for (const banco in groupedbybank) {
				let valor = 0;
				if (groupedbybank.hasOwnProperty(banco)) {
					groupedbybank[banco].map((item) => {
						valor += parseFloat(item.valorComprovante);
					});
					somaDosBancos[banco] = valor;
				}
			}
			setgastoCartoes({ ...gastoCartoes, [mes]: somaDosBancos });
			//console.log(gastoCartoes);
		} else {
			groupedByDay = null;
		}

		setConteudo({
			...conteudo,
			[ano]: {
				...conteudo[ano],
				[mes]: {
					...conteudo[ano]?.[mes],
					dias: groupedByDay,
					active: true,
				},
			},
		});

		//PORQUE EU NAO CONSIGO DEIXAR ESTE COMO IDENTIFICADOR DE ATIVO DE LOAD
		//ESTE PEGA E ACRESCENTA CADA DIV ABERTA NO MOMENTO
		//E DEPOIS DEIXA O STATUS DELA COMO ACTIVE TRUE OU FALSE
		//COMO VAI PASSAR POR UM LOOP ELE VAI PASSAR POR TODOS TODA MUDANÇA DE ESTADO
		//CAUSANDO UM LOADING PARA CADA ITEM DENTRO SERÁ?!
		setLoading(false);
	};

	const BotaoOpen = ({ mesPosicaoNoObjeto }) => {
		//if (conteudo[ano]?.[mesPosicaoNoObjeto]?.active) {
		if (conteudo[ano]?.[mesPosicaoNoObjeto]?.active) {
			console.log(conteudo);
			//console.log(mesPosicaoNoObjeto);
			return (
				<Icon
					path={mdiUnfoldLessHorizontal}
					size={1}
					onClick={() => {
						const novoState = { ...conteudo };
						//SOU OBRIGADO A FAZER UMA COPIA DE TUDO ANTES! SE N ELE ATUALIZA TUDO!
						novoState[ano] = { ...novoState[ano] };
						novoState[ano][mesPosicaoNoObjeto] = {
							...novoState[ano][mesPosicaoNoObjeto],
						};
						novoState[ano][mesPosicaoNoObjeto].active = false;

						setConteudo(novoState);
						setDadosFiltrados(null); //FIX FILTRO
					}}
				/>
			);
		} else {
			return (
				<Icon
					path={mdiUnfoldMoreHorizontal}
					size={1}
					onClick={() => CarregarMes(mesPosicaoNoObjeto)}
				/>
			);
		}
	};

	const definirAno = (anoAtivar) => {
		setAno(anoAtivar);
		//setConteudo({}); //REMOVE ULTIMO ABERTO DO ANO
	};

	const editarPostComprovante = async (id) => {
		setidEditando(id);
		const response = await fetch(`${Gfetch}/data/comprovante`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ idComprovante: id }),
		});
		const data = await response.json();

		sethandleDadosForm(data);
		setEditando(true);
		//console.log(data);
	};

	const handleDados = (e) => {
		sethandleDadosForm({
			...handleDadosForm,
			[e.target.name]: e.target.value,
		});
	};

	const formatMonth = (month) => {
		return month < 10 ? `0${month}` : `${month}`;
	};

	const handleSubmitEdit = async (e) => {
		e.preventDefault();

		const [ano, mes, dia] = handleDadosForm?.data.split('-');

		setLoading(true);

		const formData = new FormData(e.currentTarget);

		formData.append('idEditar', idEditando);
		formData.append('editar', true);

		const response = await fetch(`${Gfetch}/upload`, {
			method: 'POST',
			body: formData,
		});

		const data = await response.json();

		if (response.ok) {
			closeDialog();
			CarregarMes(formatMonth(mes));
			setLoading(false);
		}
	};

	const closeDialog = () => {
		setEditando(false);
		sethandleDadosForm({});
		setidEditando({});
	};

	const converterParaReal = (valor, cifrao = true) => {
		if (valor) {
			let valorConvertido = parseFloat(valor).toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			});

			return cifrao ? valorConvertido : valorConvertido.replace('R$', '');
		} else {
			return `${cifrao ? 'R$' : ''} 0,00`;
		}
	};

	const fileNamePop = (nomeArquivo) => {
		let lista = nomeArquivo?.split('/');
		return nomeArquivo && lista.pop(); //POP PEGA O ULTIMO ITEM DO ARRAY!
	};

	const buscarFiltrar = (e, ano, mes) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		let termo = formData.get('buscar');

		if (!termo) {
			setDadosFiltrados(conteudo); // Restaura os dados originais se a busca estiver vazia
		} else {
			let dados = conteudo[ano][mes].dias;
			let resultadosFiltrados = {};

			for (const dia in dados) {
				dados[dia].forEach((comprovante) => {
					if (
						comprovante.motivoComprovante
							.toLowerCase()
							.includes(termo.toLowerCase())
					) {
						if (resultadosFiltrados.hasOwnProperty(dia)) {
							resultadosFiltrados[dia].push(comprovante);
						} else {
							resultadosFiltrados[dia] = [comprovante];
						}
					}
				});
			}

			//CORREÇÂO
			if (!Object.keys(resultadosFiltrados).length) {
				resultadosFiltrados = {
					na: {
						results: 0,
						message: 'Nenhum resultado!',
					},
				};
			}

			setDadosFiltrados({
				...conteudo,
				[ano]: {
					...conteudo[ano],
					[mes]: {
						...conteudo[ano]?.[mes],
						dias: resultadosFiltrados,
						active: true,
					},
				},
			});

			//console.log(dadosFiltrados);
		}
	};

	const Busca = ({ ano, mes }) => {
		//console.log(mes);
		return (
			<form
				key={ano + mes}
				className='comprovantes-grupo-busca'
				onSubmit={(e) => buscarFiltrar(e, ano, mes)}>
				<div className='comprovantes-grupo-busca-active'>
					<input
						name='buscar'
						type='text'
						//ref={buscaRef}
						autoComplete='off'
						//autoFocus
						//value={termoBusca[mes]}
						placeholder='Filtrar motivo...'
						//onChange={(e) =>
						//	setTermoBusca({ ...termoBusca, [mes]: e.currentTarget.value })
						//}
					/>
					<button type='submit'>
						<Icon path={mdiTextSearchVariant} size={1} />
					</button>
				</div>
			</form>
		);
	};

	return (
		<ComprovantesContext.Provider
			value={{
				ano,
				CarregarMes,
				converterParaReal,
				conteudo,
				gastoCartoes,
				definirAno,
				BotaoOpen,
				loading,
				loadingFunctions,
				MesAtivo,
				editarPostComprovante,
				editando,
				closeDialog,
				handleDadosForm,
				handleDados,
				handleSubmitEdit,
				fileNamePop,
				dadosFiltrados,
				buscarFiltrar,
				Busca,
				totalMensal,
				loadingHeaders,
			}}>
			{children}
		</ComprovantesContext.Provider>
	);
}

export default ComprovantesProvider;
