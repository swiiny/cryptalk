import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { IDialogFlowResponse } from './useDialogFlow.type';

export async function sendMessageToDialogFlow(message: string, sessionId: string): Promise<IDialogFlowResponse> {
	// Send the message to the API route
	const response = await axios.post(
		'/api/dialogflow',
		{
			message,
			sessionId
		},
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);

	return response.data;
}

export const useDialogFlowMutation = () => {
	return useMutation(({ message, sessionId }: { message: string; sessionId: string }) =>
		sendMessageToDialogFlow(message, sessionId)
	);
};
