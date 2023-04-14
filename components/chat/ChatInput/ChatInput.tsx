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
		let userIntent: TCurrentUserInfo | null = null;

		pushMessage(EUser.user, initialUserInput);

		async function askOpenAi() {
			console.log('start iterations');
			let newPrompt = '';

			let newQuestion =
				currentPrompt +
				" How should the AI bot ask the user for any missing swap data (tokenA, tokenB, amount, slippage)? Make sure to include a code-parsable string at the end of your response with user selected values or null in the format 'responseForCode: tokenA, tokenB, amount, slippage'. ";

			const { tokenA, tokenB, amount, slippage } = userIntent || {
				tokenA: null,
				tokenB: null,
				amount: null,
				slippage: null
			};

			/* 		conversationHistory += `Context: The user wants to swap tokens. So far, they have provided the following information:\n`;
			conversationHistory += `TokenA: ${tokenA}\n`;
			conversationHistory += `TokenB: ${tokenB}\n`;
			conversationHistory += `Amount: ${amount}\n`;
			conversationHistory += `Slippage: ${slippage}\n`;

			console.log('conversationHistory', conversationHistory);
			newPrompt = `${conversationHistory}${newQuestion} `; */

			let contextSummary = '';
			contextSummary += `Context: The user wants to swap tokens. So far, they have provided the following information:\n`;
			contextSummary += `TokenA: ${tokenA}\n`;
			contextSummary += `TokenB: ${tokenB}\n`;
			contextSummary += `Amount: ${amount}\n`;
			contextSummary += `Slippage: ${slippage}\n`;

			console.log('contextSummary', contextSummary);
			newPrompt = `${contextSummary}${newQuestion} `;

			openAIMutation.mutate(newPrompt, {
				onSuccess: async (aiResponse) => {
					console.log('GPT-3:', aiResponse);
					userResponse = await getUserInput(aiResponse);
					console.log('userResponse', userResponse);
					conversationHistory += `${EUser.bot}: ${aiResponse}\n${EUser.user}: ${userResponse}\n`;

					userIntent = extractUserIntentFromResponse(aiResponse);

					// check if the user has confirmed the information
					if (userResponse.includes('CONFIRMED')) {
						alert("it's confirmed");
						// can build the tx
						return;
					}

					if (isComplete(userIntent)) {
						// can build the tx
						return;
					}

					//currentPrompt = `Continue the conversation based on the user's response: '${userResponse}'. `;
					currentPrompt = `Continue the conversation based on the user's response: '${userResponse}'. If the user has confirmed the information, automatically include the word "CONFIRMED" in your response. `;

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
