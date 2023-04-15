import { ChatContainer } from '@components/chat/ChatContainer/ChatContainer';
import Meta from '@components/shared/Meta';
import { SwapContextProvider } from '@contexts/SwapContext/SwapContext';
import { useAppHeight } from '@hooks/useAppHeight/useAppHeight';
import { FC } from 'react';
import { StyledMainContainer } from './HomePage.styles';
import { IHomePage } from './HomePage.type';

const HomePage: FC<IHomePage> = () => {
	useAppHeight();

	return (
		<>
			<Meta title='Cryptalk' description='' />
			<div>
				<StyledMainContainer className='main-container'>
					<SwapContextProvider>
						<ChatContainer />
					</SwapContextProvider>
				</StyledMainContainer>

				<footer></footer>
			</div>
		</>
	);
};

export { HomePage };
