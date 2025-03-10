'use client';
import { Gfetch } from '@/app/Fetch/FetchGlobal';
import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useEffect, useRef, useState } from 'react';

export default function Addbutton({
	conteudo,
	isOpen,
	onClose,
	onEnd,
	onEdit,
}) {
	const DialogRef = useRef(null);
	const [handleDadosForm, sethandleDadosForm] = useState({});
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [loading, setloading] = useState(false);

	useEffect(() => {
		let dialog = DialogRef.current;

		if (isDialogOpen && dialog) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [isOpen, onClose, isDialogOpen, handleDadosForm, onEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		setloading(true);

		const formData = new FormData(e.currentTarget);

		const date = new Date(formData.get('data'));
		const response = await fetch(`${Gfetch}/upload`, {
			method: 'POST',
			body: formData,
		});

		const data = await response.json();

		if (response.ok) {
			setloading(false);
			closeDialog();
			sethandleDadosForm({});
			onEnd(formatMonth(date.getMonth() + 1));
		}
	};

	const formatMonth = (month) => {
		return month < 10 ? `0${month}` : `${month}`;
	};

	const handleDados = (e) => {
		sethandleDadosForm({ ...handleDadosForm, [e.target.name]: e.target.value });
	};

	const openDialog = (e) => {
		setIsDialogOpen(true);

		//console.log(onEdit);
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
		sethandleDadosForm({});
		//clearEdit(); //LIMPA USANDO STATE DO PAI
	};

	return (
		<>
			<dialog className='modal' ref={DialogRef} onClose={closeDialog}>
				<div className='modal-close'>
					<Icon path={mdiClose} size={1} onClick={closeDialog} />
				</div>
				<h1>Adicionar Comprovante</h1>
				<form onSubmit={(e) => handleSubmit(e)}>
					<div className='modal-content'>
						<div className='modal-data-time-cartao'>
							<div className='modal-date-time'>
								<div>
									<label htmlFor='data'>Data:</label>
									<input
										id='data'
										type='date'
										name='data'
										//placeholder='DD-MM-AAAA'
										required
										value={handleDadosForm.data || ''}
										onChange={handleDados}
									/>
								</div>
								<div>
									<label htmlFor='time'>Horário:</label>
									<input
										id='time'
										type='time'
										name='time'
										step='1'
										//placeholder='HH:MM:SS'
										required
										value={handleDadosForm.time || ''}
										onChange={(e) => handleDados(e)}
									/>
								</div>
							</div>
							<div className='modal-cartao'>
								<label htmlFor='cartao'>Cartão:</label>
								<select name='cartao' onChange={(e) => handleDados(e)}>
									<option>Bradesco</option>
									<option>Banestes</option>
									<option>Caixa</option>
								</select>
							</div>
						</div>
						<label htmlFor='nome'>Responsável:</label>
						<input
							id='nome'
							type='text'
							autoComplete='off'
							name='nome'
							required
							value={handleDadosForm.nome || ''}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='motivo'>Finalidade:</label>
						<input
							id='motivo'
							type='text'
							autoComplete='off'
							name='motivo'
							required
							value={handleDadosForm.motivo || ''}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='valor'>Valor:</label>
						<input
							id='valor'
							type='number'
							step='0.01'
							autoComplete='off'
							inputMode='decimal'
							name='valor'
							required
							value={handleDadosForm.valor || ''}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='arquivo'>Arquivo do comprovante:</label>
						<input
							id='arquivo'
							type='file'
							name='arquivo'
							value={handleDadosForm.arquivo || ''}
							required
							onChange={(e) => handleDados(e)}
						/>
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
			<div className='modal-button' onClick={() => openDialog()}>
				<Icon path={mdiPlus} size={1.6} />
			</div>
		</>
	);
}
