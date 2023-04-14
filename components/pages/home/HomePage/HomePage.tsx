import { ChatContainer } from '@components/chat/ChatContainer/ChatContainer';
import Meta from '@components/shared/Meta';
import { FC } from 'react';
import { StyledMainContainer } from './HomePage.styles';
import { IHomePage } from './HomePage.type';

const HomePage: FC<IHomePage> = () => {
	return (
		<>
			<Meta title='Cryptalk' description='' />
			<div>
				<StyledMainContainer>
					<ChatContainer />
				</StyledMainContainer>

				<footer></footer>
			</div>
		</>
	);
};

export { HomePage };
