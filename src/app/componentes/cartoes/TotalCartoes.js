import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';
import React, { useContext, useEffect, useState } from 'react';
import { BsCalendarCheck, BsCalendarEvent } from 'react-icons/bs';

export default function TotalCartoes({ ano, mes }) {
	const {
		converterParaReal,
		gastoCartoes,
		conteudo,
		CorDoBanco,
		backupConteudo,
	} = useContext(ComprovantesContext);

	const [somadosDias, setSomadosdias] = useState(parseFloat(0));
	const [somaF, setSomaF] = useState(parseFloat(0));
	const [isLoading, setIsLoading] = useState(true); // Adiciona um estado de carregamento

	useEffect(() => {
		setIsLoading(true); // Inicia o carregamento

		let cont = conteudo?.[ano]?.[mes]?.dias;
		let soma = 0;

		let contFull = backupConteudo?.[ano]?.[mes]?.dias;
		let somaFull = 0;

		for (const dia in cont) {
			const arrayDeObjetos = cont[dia];
			for (const dias of arrayDeObjetos) {
				if (dias?.hasOwnProperty?.('valorComprovante')) {
					let valor = parseFloat(dias?.valorComprovante);
					soma += valor;
				}
			}
		}

		for (const dia in contFull) {
			const arrayDeObjetos = contFull[dia];
			for (const dias of arrayDeObjetos) {
				if (dias?.hasOwnProperty?.('valorComprovante')) {
					let valor = parseFloat(dias?.valorComprovante);
					somaFull += valor;
				}
			}
		}

		//console.log('Somafull:', somaFull);
		setSomaF({ [mes]: somaFull });
		setSomadosdias({
			[mes]: soma,
		});

		setIsLoading(false); // Finaliza o carregamento

		//console.log('Soma Full', somaF);
		//console.log('Soma dos dias', somadosDias);

		//console.log(`No mes: ${mes}`, soma);
		//console.log(typeof totalMes);
		//console.log(typeof soma);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//const totalMes = totalMensal[ano][mes]; //TOTAL VIA EVENTSOURCE
	const totalMesFull = somaF[mes]; //TOTAL VIA EVENTSOURCE
	const somaFiltrado = somadosDias[mes];

	//console.log('Todos os filtrados', backupConteudo);
	//console.log('Total mes: ', totalMes);
	//console.log('Soma filtro', somaFiltrado);

	let valorFim = 0;

	return (
		<div className='comprovantes-mes-total-mes'>
			<div className='comprovantes-mes-total-gasto-cartao'>
				{Object?.keys(gastoCartoes[mes])?.map((cartao, index) => {
					let valorFinal = gastoCartoes[mes][cartao];
					valorFim += valorFinal;

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
					{isLoading ? (
						<div className='comprovantes-loading'>
							Carregando &nbsp;&nbsp;&nbsp;<div className='loader'></div>
						</div>
					) : (
						<>
							<div>
								<BsCalendarCheck className='icons-react' />
							</div>
							<span className='span-color'>R$ </span>
							<div>{converterParaReal(totalMesFull, false)}</div>
						</>
					)}
				</div>
				{converterParaReal(totalMesFull, false) !==
					converterParaReal(somaFiltrado, false) &&
					somaFiltrado !== undefined && (
						<div className='comprovantes-mes-total-filtrado'>
							<div>
								<BsCalendarEvent className='icons-react' />
							</div>
							<span className='span-color'>R$ </span>
							<div>{converterParaReal(somaFiltrado, false)}</div>
						</div>
					)}
			</div>
		</div>
	);
}
