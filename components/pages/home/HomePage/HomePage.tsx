import { ChatContainer } from '@components/chat/ChatContainer/ChatContainer';
import Meta from '@components/shared/Meta';
import { SwapContextProvider } from '@contexts/SwapContext/SwapContext';
import { FC } from 'react';
import { StyledMainContainer } from './HomePage.styles';
import { IHomePage } from './HomePage.type';

const HomePage: FC<IHomePage> = () => {
	return (
		<>
			<Meta title='Cryptalk' description='' />
			<div>
				<StyledMainContainer>
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
