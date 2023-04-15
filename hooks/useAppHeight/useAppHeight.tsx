import { EMediaQuery } from '@theme/theme.enum';
import { mq } from '@utils/functions';
import { useEffect } from 'react';

const useAppHeight = () => {
	useEffect(() => {
		let resizeObserver: ResizeObserver;

		try {
			const setHeight = () => {
				const windowHeight = window.innerHeight;

				let value = `${Math.floor(windowHeight - 20)}px`;

				const styleId = 'style-app-height';

				let styleElement = document.getElementById(styleId);

				if (!styleElement) {
					const style = document.createElement('style');
					style.id = styleId;

					style.innerHTML = `${mq(EMediaQuery.md, `[class*="main-container"] { height: ${value}; }`, 'max')}`;

					// append style element to head
					document.head.appendChild(style);
				} else {
					// if style element with id 'main-container' exists update it's content
					styleElement.innerHTML = `${mq(EMediaQuery.md, `[class*="main-container"] { height: ${value}; }`, 'max')}`;
				}
			};

			setHeight();

			// @ts-ignore
			resizeObserver = new ResizeObserver(() => {
				setHeight();
			});

			// observe body height updates
			resizeObserver?.observe(document.body);
		} catch (err) {
			console.error('subpage resize observer', err);
		}

		return () => {
			resizeObserver?.disconnect();
		};
	}, []);

	return <></>;
};

export { useAppHeight };
