import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { pushNewMessage } from '../useMessagesQuery/useMessagesQuery';
import { IMessage } from '../useMessagesQuery/useMessagesQuery.type';

export async function sendMessageToOpenAI(input: string, queryClient: QueryClient): Promise<string> {
	const newMessage: IMessage = {
		user: 'User',
		value: input,
		timestamp: Date.now()
	};

	// Update the messages query cache on successful mutation
	pushNewMessage(newMessage, queryClient);

	// Replace this with the actual API call to send a message to OpenAI and get the response
	return 'test response value';
}

export const useOpenAIMutation = () => {
	const queryClient = useQueryClient();

	return useMutation<string, Error, string>((userInput: string) => sendMessageToOpenAI(userInput, queryClient), {
		onSuccess: (data: string) => {
			const newMessage: IMessage = {
				user: 'gpt-3.5',
				value: data,
				timestamp: Date.now()
			};

			pushNewMessage(newMessage, queryClient);
		}
	});
};
