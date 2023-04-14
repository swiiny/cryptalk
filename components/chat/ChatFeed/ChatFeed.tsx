import useMessagesQuery from '@hooks/chat/useMessagesQuery';
import { ChatFeedBox } from 'ChatFeedBox/ChatFeedBox';
import { FC } from 'react';
import { StyledChatFeed } from './ChatFeed.styles';
import { IChatFeed } from './ChatFeed.type';

const ChatFeed: FC<IChatFeed> = () => {
	const { messages } = useMessagesQuery();

	return (
		<StyledChatFeed id='chat-feed-container'>
			{messages.map((message, index) => (
				<ChatFeedBox key={message.id} {...message} />
			))}
		</StyledChatFeed>
	);
};

export { ChatFeed };
