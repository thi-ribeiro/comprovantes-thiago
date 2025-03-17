'use client';

import { Gfetch } from '@/app/Fetch/FetchGlobal';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../login/LoginContext';
import _ from 'lodash';
import Icon from '@mdi/react';
import {
	mdiFilter,
	mdiFilterCheckOutline,
	mdiFilterCogOutline,
	mdiFilterOutline,
	mdiMagnify,
	mdiSearchWeb,
	mdiTextSearchVariant,
	mdiUnfoldLessHorizontal,
	mdiUnfoldMoreHorizontal,
} from '@mdi/js';

import {
	BsChevronBarContract,
	BsChevronBarExpand,
	BsChevronContract,
	BsChevronDown,
	BsChevronExpand,
	BsChevronUp,
	BsFilter,
	BsSearch,
} from 'react-icons/bs';

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
	const [dadosFiltrados, setDadosFiltrados] = useState({});
	const [totalMensal, settotalMensal] = useState([]);
	const [aberto, setAberto] = useState(false);

	const [buscaTermo, setbuscaTermo] = useState({});

	const { user } = useContext(LoginContext);

	useEffect(() => {
		const eventSomatoriaMes = new EventSource(`${Gfetch}/somaMeses`);

		eventSomatoriaMes.onmessage = (event) => {
			const dados = JSON.parse(event.data);
			// const dadosAno = dados.filter((item) => {
			// 	return item.ano.split('-')[0] === ano.toString();
			// });

			//console.log(dados);

			if (!_.isEqual(dados, totalMensal)) {
				setLoadingHeaders(false);
				settotalMensal(dados);
			}
		};

		return () => {
			eventSomatoriaMes.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ano]);

	const CarregarMes = async (mes) => {
		apagarBusca(mes);
		setLoading(true);

		let token = localStorage?.getItem('token');

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

		const conteudoNovo = { ...conteudo };
		conteudoNovo[ano] = {
			...conteudoNovo[ano],
			[mes]: {
				...conteudoNovo[ano]?.[mes],
				dias: groupedByDay,
			},
		};

		setConteudo(conteudoNovo);
		//PORQUE EU NAO CONSIGO DEIXAR ESTE COMO IDENTIFICADOR DE ATIVO DE LOAD
		//ESTE PEGA E ACRESCENTA CADA DIV ABERTA NO MOMENTO
		//E DEPOIS DEIXA O STATUS DELA COMO ACTIVE TRUE OU FALSE
		//COMO VAI PASSAR POR UM LOOP ELE VAI PASSAR POR TODOS TODA MUDANÇA DE ESTADO
		//CAUSANDO UM LOADING PARA CADA ITEM DENTRO SERÁ?!
		setLoading(false);
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
			CarregarMes(mes);
			setbuscaTermo({}); //VERIFICAR DEPOIS
			setDadosFiltrados({}); //VERIFICAR DEPOIS
			setLoading(false);
		}
	};

	const BotaoOpen = ({ mesPosicaoNoObjeto }) => {
		//console.log(MesAtivo);
		if (conteudo?.[ano]?.hasOwnProperty(mesPosicaoNoObjeto)) {
			return (
				<BsChevronUp
					className='icons-react'
					onClick={() => {
						const novoEstadoConteudo = { ...conteudo };
						delete conteudo?.[ano]?.[mesPosicaoNoObjeto];

						const novoEstadoFiltrado = { ...dadosFiltrados };
						delete dadosFiltrados?.[ano]?.[mesPosicaoNoObjeto];

						//setMesAtivo({});

						setConteudo(novoEstadoConteudo);
						setDadosFiltrados(novoEstadoFiltrado);

						//NÃO SALVA O RESULTADO E RECARREGA OS DADOS ASSIM QUE ABRIR
					}}
				/>
			);
		} else {
			return (
				<BsChevronDown
					className='icons-react'
					onClick={() => CarregarMes(mesPosicaoNoObjeto)}
				/>
			);
		}
	};

	const definirAno = (anoAtivar) => {
		setAno(anoAtivar);
		//setConteudo({}); //REMOVE ULTIMO ABERTO DO ANO
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
			return `${cifrao ? 'R$  ' : '\u00A0'}0,00`; // Dois espaços após 'R$' e dois espaços antes de '0,00'
		}
	};

	const fileNamePop = (nomeArquivo) => {
		let lista = nomeArquivo?.split('/');
		return nomeArquivo && lista.pop(); //POP PEGA O ULTIMO ITEM DO ARRAY!
	};

	const apagarBusca = (posicao) => {
		const { [posicao]: _, ...novoEstado } = buscaTermo;
		setbuscaTermo(novoEstado);
	};

	const buscarFiltrar = (e, ano, mes) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const termo = formData.get('buscar');

		if (!termo) {
			apagarBusca(mes);

			setDadosFiltrados({
				...dadosFiltrados,
				[ano]: {
					...dadosFiltrados[ano],
					[mes]: {
						...dadosFiltrados[ano]?.[mes],
						dias: conteudo[ano][mes].dias,
					},
				},
			});
		} else {
			const dados = conteudo?.[ano]?.[mes]?.dias;

			console.log('Mes selecionado: ' + mes);
			console.log(conteudo?.[ano]);

			let resultadosFiltrados = {};

			// for (const dia in dados) {
			// 	dados?.[dia].forEach((comprovante) => {
			// 		console.log(comprovante);
			// 		if (
			// 			comprovante.motivoComprovante
			// 				.trim()
			// 				.toLowerCase()
			// 				.includes(termo.trim().toLowerCase())
			// 		) {
			// 			if (resultadosFiltrados.hasOwnProperty(dia)) {
			// 				resultadosFiltrados[dia].push(comprovante);
			// 			} else {
			// 				console.log('N TEM? O DIA!');
			// 				console.log(comprovante);
			// 				resultadosFiltrados[dia] = [comprovante];
			// 			}
			// 		}
			// 	});
			// }
			for (const dia in dados) {
				console.log(dia);
				dados?.[dia].forEach((comprovante) => {
					console.log(comprovante);
					if (
						comprovante.motivoComprovante
							.trim()
							.toLowerCase()
							.includes(termo.trim().toLowerCase())
					) {
						if (resultadosFiltrados.hasOwnProperty(dia)) {
							resultadosFiltrados[dia].push(comprovante);
						} else {
							console.log('N TEM? O DIA!');
							console.log(comprovante);
							resultadosFiltrados[dia] = [comprovante];
						}
					}
				});
			}

			console.log('DADOS FILTRADOS');
			console.log(resultadosFiltrados);

			//CORREÇÂO
			setDadosFiltrados({
				...dadosFiltrados,
				[ano]: {
					...dadosFiltrados[ano],
					[mes]: {
						...dadosFiltrados[ano]?.[mes],
						dias: !Object.keys(resultadosFiltrados).length
							? {}
							: resultadosFiltrados,
					},
				},
			});

			setbuscaTermo({ ...buscaTermo, [mes]: termo });
		}

		//console.log(conteudo);
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
						autoComplete='off'
						placeholder={
							buscaTermo.hasOwnProperty(mes) ? buscaTermo[mes] : 'Buscar por...'
						}
					/>
					<button type='submit'>
						<BsSearch className='icons-react' />
					</button>
				</div>
			</form>
		);
	};

	const alternarAberto = () => {
		setAberto(!aberto);
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
				aberto,
			}}>
			{children}
		</ComprovantesContext.Provider>
	);
}

export default ComprovantesProvider;
