import { Button } from '@components/shared/Button/Button';
import { pushNewMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { IMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery.type';
import { useOpenAIMutation } from '@hooks/chat/useOpenAIMutation/useOpenAIMutation';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StyledChatInput } from './ChatInput.styles';
import { IChatInput } from './ChatInput.type';

type TCurrentUserInfo = {
	tokenA: string | null;
	tokenB: string | null;
	amount: number | null;
	slippage: number | null;
};

function extractUserIntentFromResponse(response: string): TCurrentUserInfo {
	const codeResponseRegex = /responseForCode: (.*), (.*), (.*), (.*)/;
	const matches = response.match(codeResponseRegex);

	if (matches && matches.length === 5) {
		const tokenA = matches[1] === 'null' ? null : matches[1];
		const tokenB = matches[2] === 'null' ? null : matches[2];
		const amount = matches[3] === 'null' ? null : parseFloat(matches[3]);
		const slippage = matches[4] === 'null' ? null : parseFloat(matches[4]);

		return {
			tokenA,
			tokenB,
			amount,
			slippage
		};
	}

	return {
		tokenA: null,
		tokenB: null,
		amount: null,
		slippage: null
	};
}

function isComplete(userIntent: TCurrentUserInfo | null) {
	return (
		userIntent &&
		userIntent.tokenA !== null &&
		userIntent.tokenA !== 'tokenA' &&
		userIntent.tokenB !== null &&
		userIntent.tokenB !== 'tokenB' &&
		typeof userIntent.amount === 'number' &&
		userIntent.amount > 0 &&
		typeof userIntent.slippage === 'number' &&
		userIntent.slippage > 0
	);
}
function formatResponse(response: string) {
	// remove everything before first "
	let messageToDisplay = response.replace(/.*?"/, '');

	// remove everything after last "
	messageToDisplay = messageToDisplay.replace(/".*/, '');

	// remove all newlines
	messageToDisplay = messageToDisplay.replace(/(\r\n|\n|\r)/gm, '');

	// remove all tabs
	messageToDisplay = messageToDisplay.replace(/\t/g, '');

	// remove everything after responseForCode:
	messageToDisplay = messageToDisplay.replace(/responseForCode:.*$/, '');

	return messageToDisplay;
}

enum EInputType {
	selectAction = 'selectAction',
	swap = 'swap'
}

enum EUser {
	bot = 'GPT-3',
	user = 'User'
}

const ChatInput: FC<IChatInput> = () => {
	const queryClient = useQueryClient();
	const openAIMutation = useOpenAIMutation();
	const [inputType, setInputType] = useState<EInputType>(EInputType.selectAction);

	function pushMessage(user: EUser, message: string) {
		const newMessage: IMessage = {
			id: uuidv4(),
			user,
			value: message,
			timestamp: Date.now()
		};

		pushNewMessage(newMessage, queryClient);
	}

	async function getUserInput(aiResponse: string): Promise<string> {
		pushMessage(EUser.bot, formatResponse(aiResponse));

		return new Promise((resolve) => {
			function handleKeyPress(e) {
				if (e.key === 'Enter') {
					const inputElement = document.getElementById('chat-input') as HTMLInputElement;
					const message = inputElement.value;

					pushMessage(EUser.user, message);

					document.removeEventListener('keypress', handleKeyPress);

					resolve(message);
					inputElement.value = '';
				}
			}

			document.addEventListener('keypress', handleKeyPress);
		});
	}

	async function collectSwapInformation(initialUserInput: string): Promise<void> {
		let conversationHistory = '';

		// Get the initial user input
		console.log('Please enter your swap request:');
		conversationHistory += `${EUser.user}: ${initialUserInput}\n`;

		// Let GPT-3 handle the conversation
		const initialPrompt = `User wants to execute a swap. They said: '${initialUserInput}'.\n`;
		let currentPrompt = initialPrompt;
		let userResponse = '';
		let userIntent = null;

		pushMessage(EUser.user, initialUserInput);

		console.log('isComplete(userIntent)', isComplete(userIntent));

		async function askOpenAi() {
			console.log('start iterations');
			// Replace the getOpenAIResponse function call with the openAIMutation.mutate function
			let newPrompt = '';

			let newQuestion =
				currentPrompt +
				" When providing a response, also include a code-parsable string with the format 'responseForCode: tokenA, tokenB, amount, slippage'.";

			console.log('conversationHistory', conversationHistory);
			newPrompt = `${conversationHistory}${newQuestion}, How should the AI bot ask the user for missing swap data (tokenA, tokenB, amount, slippage)? `;

			openAIMutation.mutate(newPrompt, {
				onSuccess: async (aiResponse) => {
					console.log('GPT-3:', aiResponse);
					userResponse = await getUserInput(aiResponse);
					console.log('userResponse', userResponse);
					conversationHistory += `${EUser.bot}: ${aiResponse}\n${EUser.user}: ${userResponse}\n`;

					userIntent = extractUserIntentFromResponse(aiResponse);

					const { tokenA, tokenB, amount, slippage } = userIntent;

					if (isComplete(userIntent)) {
						// can build the tx
						return;
					}

					currentPrompt = `Continue the conversation based on the user's response: '${userResponse}'. Current responseForCode: tokenA='${tokenA}', tokenB='${tokenB}', amount=${amount}, slippage=${slippage}. `;

					askOpenAi();
				}
			});
		}

		askOpenAi();
	}

	if (inputType === EInputType.selectAction) {
		return (
			<Button
				onClick={() => {
					collectSwapInformation('I want to swap tokens');
					setInputType(EInputType.swap);
				}}
			>
				Swap
			</Button>
		);
	}

	return (
		<StyledChatInput>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					// scroll to bottom of chat feed with animation
					/* const id = 'chat-feed-container';
					const element = document.getElementById(id);

					if (element) {
						element.scrollIntoView({ behavior: 'smooth' });
					} */

					// trigger enter keypress event (even ig submit button is clicked)
					const inputElement = document.getElementById('chat-input') as HTMLInputElement;
					const event = new KeyboardEvent('keypress', { key: 'Enter' });
					inputElement.dispatchEvent(event);
				}}
			>
				<input id='chat-input' type='text' placeholder='I want to swap tokens...' />
				<button type='submit'>Send</button>
			</form>
		</StyledChatInput>
	);
};

export { ChatInput };
