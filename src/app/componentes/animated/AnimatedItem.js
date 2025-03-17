import { useRef, useState, useLayoutEffect } from 'react';

const AnimatedItem = ({ isActive, children, refComponente }) => {
	const ref = useRef(null);
	const [height, setHeight] = useState('0px');

	useLayoutEffect(() => {
		if (ref.current) {
			setHeight(isActive ? `${refComponente?.current?.clientHeight}px` : '0px');
		}

		//PEGA O REF DO COMPONENTE QUE ESTA MUDANDO DE TAMANHO E JOGA O VALOR DELE NO HEIGHT
		//LEMBRANDO DE FICAR VERIFICANDO ACTIVE, CHILDREN E O REF NO USEEFFECT
	}, [isActive, children, refComponente]);

	return (
		<div
			ref={ref}
			style={{
				overflow: 'hidden',
				transitionProperty: 'height, opacity',
				transitionTimingFunction: 'ease, ease-in-out',
				transitionDuration: isActive ? '0.5s, 1s' : `0.1s`,
				transitionDelay: '0.1s, 0.1s',
				opacity: isActive ? '1' : '0',
				height,
			}}>
			{children}
		</div>
	);
};

export default AnimatedItem;
