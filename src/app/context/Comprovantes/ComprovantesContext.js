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

	const [editando, setEditando] = useState({});
	const [idEditando, setidEditando] = useState(null);
	const [dadosFiltrados, setDadosFiltrados] = useState({});
	const [totalMensal, settotalMensal] = useState([]);

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

		//console.log(groupedByDay);

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

		//if (!backupConteudo?.[ano]?.[mes]) {
		setbackupConteudo({
			...backupConteudo,
			[ano]: {
				...backupConteudo[ano],
				[mes]: conteudoNovo[ano]?.[mes],
			},
		});
		//}
		//DETALHE, SE NÃO QUISER UTILIZAR A CONDICIONAL PARA CONFIRMAR EXISTENCIA POSSO FAZER POIS
		//VAI ATUALIZAR SOMENTE DENTRO DA KEY ESPECIFICA!
		//SETO BACKUPCONTEUDO somente após verificar se o valor do backupconteudo nao existe
		//pois se não houver verificação os valores do backup que estou usando são sobreescrevidos
		//causando aquela falha de busca apos abrir um mes...

		setLoading(false);
	};

	const editarPostComprovante = async (id, mes) => {
		const comprovanteEncontrado = Object.values(conteudo[ano][mes].dias)
			.flatMap((comprovantes) => comprovantes)
			.find((comprovante) => comprovante.idComprovante === id);

		setidEditando(comprovanteEncontrado);
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

	const closeDialog = () => {
		setEditando(false);
		//clearForms();
		setidEditando({});
	};

	const clearForms = () => {
		sethandleDadosForm({});
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
			apagarBusca(mes);

			//if (backupConteudo?.[ano]?.[mes]?.dias !== conteudo?.[ano]?.[mes]?.dias) {
			setConteudo((prevConteudo) => ({
				...prevConteudo,
				[ano]: {
					...prevConteudo[ano],
					[mes]: backupConteudo[ano][mes],
				},
			})); //SETA DIRETAMENTE O MES COM BACKUP DO CONTEUDO
			//}
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
				setConteudo,
				gastoCartoes,
				definirAno,
				BotaoOpen,
				loading,
				loadingFunctions,
				MesAtivo,
				editarPostComprovante,
				editando,
				closeDialog,
				idEditando,
				fileNamePop,
				dadosFiltrados,
				buscarFiltrar,
				Busca,
				totalMensal,
				loadingHeaders,
				CorDoBanco,
				clearForms,
				backupConteudo,
				setbackupConteudo,
			}}>
			{children}
		</ComprovantesContext.Provider>
	);
}

export default ComprovantesProvider;
