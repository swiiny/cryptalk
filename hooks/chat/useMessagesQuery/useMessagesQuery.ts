import { QueryClient, useQuery } from '@tanstack/react-query';
import { IMessage } from './useMessagesQuery.type';

async function fetchMessages(): Promise<IMessage[]> {
	// Replace this with the actual API call to fetch messages
	return [];
}

export function pushNewMessage(newMessage: IMessage, queryClient: QueryClient) {
	queryClient.setQueryData<IMessage[]>(['messages'], (oldData) => {
		if (oldData) {
			return [...oldData, newMessage];
		} else {
			return [newMessage];
		}
	});
}

function useMessagesQuery() {
	const { data: messages = [] } = useQuery<IMessage[], Error>({
		queryKey: ['messages'],
		queryFn: fetchMessages
	});

	// generate conversation history for GPT-3.5
	const conversationHistory: string = messages
		.sort((a, b) => a.timestamp - b.timestamp)
		.reduce((acc, message) => {
			const { user, value } = message;
			const newLine = `${user}: ${value}\n`;
			return acc + newLine;
		}, '');

	return {
		messages,
		conversationHistory
	};
}

export { useMessagesQuery };
