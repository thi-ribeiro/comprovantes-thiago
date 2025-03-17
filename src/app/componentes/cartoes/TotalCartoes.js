import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';
import React, { useContext, useEffect, useState } from 'react';
import { BsCalendarCheck, BsCalendarEvent, BsDot } from 'react-icons/bs';

export default function TotalCartoes({ ano, mes }) {
	const { converterParaReal, gastoCartoes, totalMensal, conteudo, CorDoBanco } =
		useContext(ComprovantesContext);

	const [somadosDias, setSomadosdias] = useState(parseFloat(0));

	useEffect(() => {
		let cont = conteudo[ano][mes].dias;
		let soma = 0;

		for (const dia in cont) {
			const arrayDeObjetos = cont[dia];
			for (const dias of arrayDeObjetos) {
				if (Object.prototype.hasOwnProperty.call(dias, 'valorComprovante')) {
					let valor = parseFloat(dias.valorComprovante);
					//console.log(dias);
					//console.log(`No id: ${dias.idComprovante}`, valor);
					soma += valor;
				}
			}
		}

		setSomadosdias({
			[mes]: soma,
		});

		//console.log(`No mes: ${mes}`, soma);
		//console.log(typeof totalMes);
		//console.log(typeof soma);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const totalMes = totalMensal[ano][mes];
	const somaFiltrado = somadosDias[mes];

	return (
		<div className='comprovantes-mes-total-mes'>
			<div className='comprovantes-mes-total-gasto-cartao'>
				{Object?.keys(gastoCartoes[mes])?.map((cartao, index) => {
					let valorFinal = gastoCartoes[mes][cartao];

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
					<div>{converterParaReal(totalMes, false)}</div>
				</div>
				{converterParaReal(totalMes, false) !==
					converterParaReal(somaFiltrado, false) &&
					somaFiltrado !== 0 && (
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
