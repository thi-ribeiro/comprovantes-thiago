'use client';

import { Gfetch } from '@/app/Fetch/FetchGlobal';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../login/LoginContext';
import _ from 'lodash';

import { BsChevronDown, BsChevronUp, BsDot, BsSearch } from 'react-icons/bs';

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
	const [backupConteudo, setbackupConteudo] = useState({});

	const { user } = useContext(LoginContext);

	useEffect(() => {
		const eventSomatoriaMes = new EventSource(`${Gfetch}/somaMeses`);

		eventSomatoriaMes.onmessage = (event) => {
			const dados = JSON.parse(event.data);

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

		//console.log(conteudoNovo);

		setConteudo(conteudoNovo);

		if (!backupConteudo?.[ano]?.[mes]) {
			setbackupConteudo({
				...backupConteudo,
				[ano]: {
					...backupConteudo[ano],
					[mes]: conteudoNovo[ano]?.[mes],
				},
			});
		}
		//DETALHE, SE NÃO QUISER UTILIZAR A CONDICIONAL PARA CONFIRMAR EXISTENCIA POSSO FAZER POIS
		//VAI ATUALIZAR SOMENTE DENTRO DA KEY ESPECIFICA!
		//SETO BACKUPCONTEUDO somente após verificar se o valor do backupconteudo nao existe
		//pois se não houver verificação os valores do backup que estou usando são sobreescrevidos
		//causando aquela falha de busca apos abrir um mes...

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
						setConteudo(novoEstadoConteudo);
					}}
				/>
			);
		} else {
			return (
				<BsChevronDown
					className='icons-react'
					onClick={() => {
						//console.log(conteudo);
						//console.log(backupConteudo);
						CarregarMes(mesPosicaoNoObjeto);
					}}
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
		///console.log(conteudo);
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const termo = formData.get('buscar');

		const dados = backupConteudo?.[ano]?.[mes]?.dias;

		if (!termo) {
			//console.log(dados);
			apagarBusca(mes);

			setConteudo((prevConteudo) => ({
				...prevConteudo,
				[ano]: {
					...prevConteudo[ano],
					[mes]: backupConteudo[ano][mes],
				},
			})); //SETA DIRETAMENTE O MES COM BACKUP DO CONTEUDO
		} else {
			let resultadosFiltrados = {};

			for (const dia in dados) {
				dados?.[dia].forEach((comprovante) => {
					if (
						comprovante.motivoComprovante
							.trim()
							.toLowerCase()
							.includes(termo.trim().toLowerCase())
					) {
						if (resultadosFiltrados.hasOwnProperty(dia)) {
							resultadosFiltrados[dia].push(comprovante);
						} else {
							resultadosFiltrados[dia] = [comprovante];
						}
					}
				});
			}

			setConteudo({
				...conteudo,
				[ano]: {
					...conteudo[ano],
					[mes]: {
						...conteudo[ano]?.[mes],
						dias: resultadosFiltrados,
					},
				},
			});

			setbuscaTermo({ ...buscaTermo, [mes]: termo });
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

	const CorDoBanco = ({ banco }) => {
		const cores = {
			Bradesco: '#ff0000',
			Banestes: '#79bce7',
			Caixa: '#0000ff',
		};

		const cor = cores[banco] || 'gray';
		return <BsDot className='icons-react' color={cor} />;
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
				CorDoBanco,
			}}>
			{children}
		</ComprovantesContext.Provider>
	);
}

export default ComprovantesProvider;
