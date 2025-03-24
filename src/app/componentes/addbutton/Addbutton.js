'use client';

import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';
import { Gfetch } from '@/app/Fetch/FetchGlobal';
import React, { useContext, useRef, useState } from 'react';
import { BsPlus, BsXLg } from 'react-icons/bs';

export default function Addbutton() {
	const DialogRef = useRef(null);
	//const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [handleDadosForm, sethandleDadosForm] = useState({});

	const { loading, clearForms, CarregarMes } = useContext(ComprovantesContext);

	const handleSubmit = async (e) => {
		e.preventDefault();

		//console.log(handleDadosForm);

		const formData = new FormData(e.currentTarget);
		const [ano, mes, dia] = formData?.get('dataComprovanteData')?.split('-');

		//const date = new Date(formData.get('data'));
		const response = await fetch(`${Gfetch}/upload`, {
			method: 'POST',
			body: formData,
		});

		await response.json();

		if (response.ok) {
			sethandleDadosForm({});
			CarregarMes(mes);
			closeDialog();
		}
	};

	const handleDados = (e) => {
		sethandleDadosForm({
			...handleDadosForm,
			[e.target.name]: e.target.value,
		});
	};

	const closeDialog = () => {
		DialogRef.current?.close();
	};

	const openDialog = () => {
		DialogRef.current?.showModal();
	};

	return (
		<>
			<dialog className='modal' ref={DialogRef} onClose={closeDialog}>
				<div className='modal-close'>
					<BsXLg onClick={closeDialog} />
				</div>
				<h1>Adicionar Comprovante</h1>
				<form onSubmit={(e) => handleSubmit(e)}>
					<div className='modal-content'>
						<div className='modal-data-time-cartao'>
							<div className='modal-date-time'>
								<div>
									<label htmlFor='dataComprovanteData'>Data:</label>
									<input
										id='dataComprovanteData'
										type='date'
										name='dataComprovanteData'
										value={handleDadosForm.dataComprovanteData || ''}
										onChange={handleDados}
									/>
								</div>
								<div>
									<label htmlFor='dataComprovanteHora'>Horário:</label>
									<input
										id='dataComprovanteHora'
										type='time'
										name='dataComprovanteHora'
										step='1'
										value={handleDadosForm.dataComprovanteHora || ''}
										onChange={(e) => handleDados(e)}
									/>
								</div>
							</div>
							<div className='modal-cartao'>
								<label htmlFor='cartaoComprovante'>Cartão:</label>
								<select id='cartaoComprovante' name='cartaoComprovante'>
									<option>Bradesco</option>
									<option>Banestes</option>
									<option>Caixa</option>
								</select>
							</div>
						</div>
						<label htmlFor='usuarioComprovante'>Responsável:</label>
						<input
							id='usuarioComprovante'
							type='text'
							autoComplete='off'
							name='usuarioComprovante'
							value={handleDadosForm.usuarioComprovante || ''}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='motivoComprovante'>Finalidade:</label>
						<input
							id='motivoComprovante'
							type='text'
							autoComplete='off'
							name='motivoComprovante'
							value={handleDadosForm.motivoComprovante || ''}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='valorComprovante'>Valor:</label>
						<input
							id='valorComprovante'
							type='number'
							step='0.01'
							autoComplete='off'
							inputMode='decimal'
							name='valorComprovante'
							value={handleDadosForm.valorComprovante || ''}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='arquivo'>Arquivo do comprovante:</label>
						<input id='arquivo' type='file' name='arquivo' />
						<div className='modal-functions'>
							{loading ? (
								<div className='modal-funcions-load'>
									Enviando &nbsp;&nbsp;&nbsp;<div className='loader'></div>
								</div>
							) : (
								<>
									<input type='submit' value='Enviar' />
									<input type='button' value='Cancelar' onClick={closeDialog} />
								</>
							)}
						</div>
					</div>
				</form>
			</dialog>
			<div className='modal-button' onClick={openDialog}>
				<BsPlus size={25} />
			</div>
		</>
	);
}
