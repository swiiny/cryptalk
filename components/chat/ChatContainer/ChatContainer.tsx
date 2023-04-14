import { FC } from 'react';
import { ChatFeed } from '../ChatFeed/ChatFeed';
import { ChatInput } from '../ChatInput/ChatInput';
import { StyledChatContainer } from './ChatContainer.styles';
import { IChatContainer } from './ChatContainer.type';

const ChatContainer: FC<IChatContainer> = () => {
	return (
		<StyledChatContainer>
			<ChatFeed />
			<ChatInput />
		</StyledChatContainer>
	);
};

export { ChatContainer };
