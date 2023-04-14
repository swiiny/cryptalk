import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMessagesQuery } from '../useMessagesQuery/useMessagesQuery';

export async function sendMessageToOpenAI(prompt: string): Promise<string> {
	// Send the message to the API route
	const response = await fetch('/api/openai', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ prompt })
	});

	const data = await response.json();

	return data.response;
}

export const useOpenAIMutation = () => {
	const queryClient = useQueryClient();
	const { conversationHistory } = useMessagesQuery();

	return useMutation<string, Error, string>(
		sendMessageToOpenAI /* ,
		{
			onSuccess: (data: string) => {
				const newMessage: IMessage = {
					id: uuidv4(),
					user: 'gpt-3.5',
					value: formatResponse(data),
					timestamp: Date.now()
				};

				pushNewMessage(newMessage, queryClient);
			}
		} */
	);
};
