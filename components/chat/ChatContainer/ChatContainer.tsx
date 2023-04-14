import { useMessagesQuery } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { FC, useEffect } from 'react';
import { ChatInput } from '../ChatInput/ChatInput';
import { StyledChatContainer } from './ChatContainer.styles';
import { IChatContainer } from './ChatContainer.type';

const ChatContainer: FC<IChatContainer> = () => {
	const { messages } = useMessagesQuery();

	useEffect(() => {
		console.log(messages);
	}, [messages]);

	return (
		<StyledChatContainer>
			<ChatInput />
		</StyledChatContainer>
	);
};

export { ChatContainer };
