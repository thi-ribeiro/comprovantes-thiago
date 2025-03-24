import { ComprovantesContext } from '@/app/context/Comprovantes/ComprovantesContext';
import { Gfetch } from '@/app/Fetch/FetchGlobal';
import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useContext, useEffect, useRef, useState } from 'react';

export default function EditButton() {
	const DialogRef = useRef(null);

	const [handleDadosForm, sethandleDadosForm] = useState({
		dataComprovante: '2024-01-01 00:00:00', // Valor inicial
		dataComprovanteData: '2024-01-01', // Valor inicial
		dataComprovanteHora: '00:00:00', // Valor inicial
		cartaoComprovante: '', // Valor inicial
		usuarioComprovante: '', // Valor inicial
		motivoComprovante: '', // Valor inicial
		valorComprovante: '', // Valor inicial
		linkComprovante: '', // valor inicial
	});

	const [loading, setloading] = useState(false);

	const {
		idEditando,
		closeDialog,
		fileNamePop,
		conteudo,
		CarregarMes,
		setConteudo,
		backupConteudo,
		setbackupConteudo,
	} = useContext(ComprovantesContext);

	useEffect(() => {
		const dialog = DialogRef.current;

		if (idEditando?.idComprovante !== undefined) {
			dialog.showModal();
			sethandleDadosForm(idEditando);
		} else {
			dialog.close();
		}
		//console.log(conteudo);
	}, [idEditando, conteudo, backupConteudo, DialogRef]);

	const handleDados = (e) => {
		sethandleDadosForm({
			...handleDadosForm,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmitEdit = async (e) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const [ano, mes, dia] = formData?.get('dataComprovanteData')?.split('-');
		const [anoOld, mesOld, diaOld] = handleDadosForm?.dataComprovante
			?.split(' ')[0]
			.split('-');

		formData.append('idEditar', idEditando?.idComprovante);

		let olderBuild = `${diaOld}/${mesOld}/${anoOld}`;
		// // //console.log(conteudo?.[ano]?.[mesOld]?.dias?.[olderBuild]);
		let conteudoCopi = conteudo?.[ano]?.[mesOld]?.dias?.[olderBuild];
		let conteudoCopi2 = backupConteudo?.[ano]?.[mesOld]?.dias?.[olderBuild];
		//VAI PEGAR O VALOR DO CONTEUDO ORIGINAL

		const index = conteudoCopi.findIndex(
			(comprovante) => comprovante.idComprovante === idEditando?.idComprovante
		);
		//VERIFICA O ID QUAL INDEX QUE ESTA

		const novoEstadoConteudo = { ...conteudo };
		//FAZ UMA COPIA DO CONTEUDO COMPLETO OU BACKUP

		Object.keys(conteudoCopi).length === 1
			? delete novoEstadoConteudo?.[ano]?.[mesOld]?.dias?.[olderBuild]
			: delete novoEstadoConteudo?.[ano]?.[mesOld]?.dias?.[olderBuild][index];
		//VERIFICA SE TEM 1 OCORRENCIA
		//SE TIVER 1 OCORRENCIA APAGA O DIA DO MES
		//SE TIVER MAIS OCORRENCIAS APAGA O INDEX DA OCORRENCIA DO ID

		//console.log('removi: ', novoEstadoConteudo);
		setConteudo(novoEstadoConteudo);

		const estadoBack = { ...backupConteudo };
		//FAZ UMA COPIA DO CONTEUDO COMPLETO OU BACKUP

		//console.log('Leng of conteudoCopi:', Object.keys(conteudoCopi).length);

		Object.keys(conteudoCopi2).length === 1
			? delete estadoBack?.[ano]?.[mesOld]?.dias?.[olderBuild]
			: delete estadoBack?.[ano]?.[mesOld]?.dias?.[olderBuild]?.[index];

		setbackupConteudo(estadoBack);
		//console.log('removi do backup: ', estadoBack);
		// //FUNCIONA BEM REMOVENDO O ULTIMO ATUALIZADO
		// const novoEstadoConteudo = { ...conteudo };
		// delete novoEstadoConteudo?.[ano]?.[mesOld];
		// setConteudo(novoEstadoConteudo);
		// //FUNCIONA BEM REMOVENDO O ULTIMO ATUALIZADO

		const response = await fetch(`${Gfetch}/upload`, {
			method: 'POST',
			body: formData,
		});

		await response.json();

		if (response.ok) {
			closeDialog();
			//CarregarMes(mesOld);
			CarregarMes(mes);
			setloading(false);
		}

		//console.log('Conteudo:', conteudo);
		//console.log('BackupConteudo: ', backupConteudo);
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
									<label htmlFor='dataComprovanteData'>Data:</label>
									<input
										id='dataComprovanteData'
										type='date'
										name='dataComprovanteData'
										required
										value={
											handleDadosForm?.dataComprovanteData ||
											handleDadosForm?.dataComprovante?.split(' ')?.[0]
										}
										onChange={(e) => handleDados(e)}
									/>
								</div>
								<div>
									<label htmlFor='dataComprovanteHora'>Horário:</label>
									<input
										id='dataComprovanteHora'
										type='time'
										name='dataComprovanteHora'
										step='1'
										required
										value={
											handleDadosForm?.dataComprovanteHora ||
											handleDadosForm?.dataComprovante?.split(' ')?.[1]
										}
										onChange={(e) => handleDados(e)}
									/>
								</div>
							</div>
							<div className='modal-cartao'>
								<label htmlFor='cartaoComprovante'>Cartão:</label>
								<select
									id='cartaoComprovante'
									name='cartaoComprovante'
									onChange={(e) => handleDados(e)}
									value={handleDadosForm?.cartaoComprovante}
									required
									title='Selecione o Cartão'>
									<option value=''>Selecione</option>
									<option value='Bradesco'>Bradesco</option>
									<option value='Banestes'>Banestes</option>
									<option value='Caixa'>Caixa</option>
								</select>
							</div>
						</div>
						<label htmlFor='usuarioComprovante'>Responsável:</label>
						<input
							id='usuarioComprovante'
							type='text'
							autoComplete='off'
							name='usuarioComprovante'
							required
							value={handleDadosForm?.usuarioComprovante}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='motivoComprovante'>Finalidade:</label>
						<input
							id='motivoComprovante'
							type='text'
							autoComplete='off'
							name='motivoComprovante'
							required
							value={handleDadosForm?.motivoComprovante}
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
							required
							value={handleDadosForm?.valorComprovante}
							onChange={(e) => handleDados(e)}
						/>
						<label htmlFor='arquivo_'>Arquivo do comprovante:</label>
						<input
							id='arquivo_'
							type='file'
							name='arquivo'
							required
							//onChange={(e) => handleDados(e)}
						/>
						<input
							type='hidden'
							name='deletar'
							value={fileNamePop(handleDadosForm?.linkComprovante)}
							//onChange={(e) => handleDados(e)}
						/>
						<input
							type='hidden'
							name='deletarData'
							value={handleDadosForm?.dataComprovante}
							//onChange={(e) => handleDados(e)}
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
		</>
	);
}
