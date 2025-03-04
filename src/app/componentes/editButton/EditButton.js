import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';
import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useContext, useEffect, useRef } from 'react';

export default function EditButton() {
	const DialogRef = useRef(null);

	const {
		editando,
		closeDialog,
		handleDadosForm,
		handleDados,
		handleSubmitEdit,
	} = useContext(ComprovantesContext);

	useEffect(() => {
		let dialog = DialogRef.current;

		if (editando) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [editando]);

	const fileName = (nomeArquivo) => {
		let lista = nomeArquivo?.split('/');
		return nomeArquivo && lista.pop(); //POP PEGA O ULTIMO ITEM DO ARRAY!
	};

	return (
		<>
			<dialog className='modal' ref={DialogRef} onClose={closeDialog}>
				<div className='modal-close'>
					<Icon path={mdiClose} size={1} onClick={closeDialog} />
				</div>
				<h1>Editar comprovante</h1>
				<form onSubmit={(e) => handleSubmitEdit(e)}>
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
								<select
									name='cartao'
									value={handleDadosForm.cartao || ''}
									onChange={(e) => handleDados(e)}>
									<option>Bradesco</option>
									<option>Banestes</option>
									<option>Caixa</option>
								</select>
							</div>
						</div>
						<label htmlFor='nome'>Nome:</label>
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
							key='arquivoInput'
							id='arquivo'
							type='file'
							name='arquivo'
							required
							onChange={(e) => handleDados(e)}
						/>
						<input
							type='hidden'
							name='deletar'
							defaultValue={fileName(handleDadosForm.arquivoOriginal)}
							onChange={(e) => handleDados(e)}
						/>
						<div className='modal-functions'>
							{false ? (
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
		</>
	);
}
