import { ChatFeedBox } from '@components/chat/ChatFeedBox/ChatFeedBox';
import useMessagesQuery from '@hooks/chat/useMessagesQuery';
import { FC, useEffect } from 'react';
import { StyledChatFeed } from './ChatFeed.styles';
import { IChatFeed } from './ChatFeed.type';

const ChatFeed: FC<IChatFeed> = () => {
	const { messages } = useMessagesQuery();

	// scroll to bottom with animatino on new message
	useEffect(() => {
		const chatFeedContainer = document.getElementById('chat-feed-container');
		if (chatFeedContainer) {
			chatFeedContainer.scrollTo({
				top: chatFeedContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}, [messages]);

	return (
		<StyledChatFeed id='chat-feed-container'>
			{messages.map((message, index) => (
				<ChatFeedBox key={message.id} {...message} />
			))}
		</StyledChatFeed>
	);
};

export { ChatFeed };
