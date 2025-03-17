'use client';

import { Gfetch } from '@/app/Fetch/FetchGlobal';
import React, { useRef, useState, useEffect } from 'react';
import { BsChevronDown } from 'react-icons/bs';

export default function SelectThiago({ onAnoSelecionado, dadosFetch }) {
	const [dropdownState, setdropdownState] = useState(false);
	const [anoSel, setanoSel] = useState(null);
	const [dadosAno, setdadosAno] = useState({});
	const [carregando, setcarregando] = useState(true);

	const selectRef = useRef(null);

	useEffect(() => {
		const requestAnos = async () => {
			const response = await fetch(`${Gfetch}/data/comprovantes/ano`);
			const data = await response.json();

			setdadosAno(data);
			setanoSel(data[0].ano);
			setcarregando(false);
		};

		requestAnos();
	}, []);
	// NEM EU SABIA QUE DAVA PRA USAR DOIS USEEFFECT!
	//ASSIM ELE TRATA DE DUAS COISAS DIFERENTES
	//O ESTADO UNICO DO FETCH DE ANOS E DO STATE DO DROPDOWN

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				console.log(event);
				setdropdownState(false);
			}
		};
		document.addEventListener('click', handleClickOutside); //DEIXA UM EVENTLISTENER RODANDO
		// SE CLICAR EM ALGO DIFERENTE DO REF ELE FECHA
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [dropdownState]);

	if (!dadosAno) return null;

	return (
		<div className='select-comprovantes'>
			<div className='select-headers'>
				<div className='select-list'>
					{carregando ? (
						<div className='select-list-item'>
							Carregando &nbsp;&nbsp;&nbsp;<div className='loader'></div>
						</div>
					) : (
						<>
							Ano selecionado <span className='span-color'>{anoSel}</span>
						</>
					)}
				</div>
				<div className='header-divisor'></div>
				<div
					className='select-header-arrow'
					onClick={() => setdropdownState(!dropdownState)}>
					<BsChevronDown className='icons-react' />
				</div>
			</div>
			{dropdownState && (
				<div ref={selectRef} className='select-options'>
					{Object.values(dadosAno).map((item, index) => {
						//console.log(item.ano);
						return (
							<div
								key={index}
								className='option'
								onClick={() => {
									setanoSel(item.ano);
									setdropdownState(false);
									onAnoSelecionado(item.ano);
								}}>
								{item.ano}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
