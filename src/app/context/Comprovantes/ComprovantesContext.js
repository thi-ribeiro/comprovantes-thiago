'use client';

import { Gfetch } from '@/app/Fetch/FetchGlobal';
import React, { createContext, useContext, useState } from 'react';
import { LoginContext } from '../login/LoginContext';
import _ from 'lodash';
import Icon from '@mdi/react';
import { mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';

export const ComprovantesContext = createContext();

function ComprovantesProvider({ children }) {
	const [ano, setAno] = useState(new Date().getFullYear()); //ANO PADRAO ATUAL
	const [conteudo, setConteudo] = useState({});
	const [loading, setLoading] = useState(false);
	const [loadingFunctions, setLoadingFunctions] = useState(true); //A IDEIA ERA COMEÇAR JÁ RODANDO LOADING
	const [MesAtivo, setMesAtivo] = useState({});
	const [gastoCartoes, setgastoCartoes] = useState({});
	const [handleDadosForm, sethandleDadosForm] = useState({});
	const [editando, setEditando] = useState(null);
	const [idEditando, setidEditando] = useState(null);

	const { user } = useContext(LoginContext);

	const CarregarMes = async (mes) => {
		setLoading(true);

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

		const promises = [
			fetch(`${Gfetch}/data/comprovantes/especifico`, optionsFetch),
			fetch(`${Gfetch}/setUso`, optionsFetch),
		];

		const responses = await Promise.all(promises);
		//trata as duas promises, se uma rejeitada para o processamento
		const respostaComprovantes = await responses[0].json();

		if (respostaComprovantes.tokenStatus === false) {
			window.location.href = '/login';
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

	const IconButton = ({ mesPosicaoNoObjeto }) => {
		if (conteudo[ano]?.[mesPosicaoNoObjeto]?.active) {
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

		setLoading(true);

		const formData = new FormData(e.currentTarget);

		formData.append('idEditar', idEditando);
		formData.append('editar', true);

		const date = new Date(formData.get('data'));
		const response = await fetch(`${Gfetch}/upload`, {
			method: 'POST',
			body: formData,
		});

		const data = await response.json();

		if (response.ok) {
			closeDialog();
			CarregarMes(formatMonth(date.getMonth() + 1));
			setLoading(false);
		}
	};

	const closeDialog = () => {
		setEditando(false);
		sethandleDadosForm({});
		setidEditando({});
	};

	return (
		<ComprovantesContext.Provider
			value={{
				ano,
				CarregarMes,
				conteudo,
				gastoCartoes,
				definirAno,
				IconButton,
				loading,
				loadingFunctions,
				MesAtivo,
				editarPostComprovante,
				editando,
				closeDialog,
				handleDadosForm,
				handleDados,
				handleSubmitEdit,
			}}>
			{children}
		</ComprovantesContext.Provider>
	);
}

export default ComprovantesProvider;
