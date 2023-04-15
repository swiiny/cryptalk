import { pushNewMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { IMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery.type';
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
	const [message, setMessage] = useState('');
	//const openAIMutation = useOpenAIMutation();
	//const [inputType, setInputType] = useState<EInputType>(EInputType.selectAction);

	function pushMessage(user: EUser, message: string) {
		const newMessage: IMessage = {
			id: uuidv4(),
			user,
			value: message,
			timestamp: Date.now()
		};

		pushNewMessage(newMessage, queryClient);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		const response = await fetch('/api/dialogflow', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message })
		});

		if (response.ok) {
			const data = await response.json();
			console.log('Intent:', data.intent);
			console.log('Token A:', data.tokenA);
		} else {
			console.error('Error:', await response.text());
		}

		setMessage('');
	};

	return (
		<StyledChatInput>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					pushMessage(EUser.user, message);
					handleSubmit(e);
				}}
			>
				<input
					id='chat-input'
					type='text'
					placeholder='I want to swap tokens...'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button type='submit'>Send</button>
			</form>
		</StyledChatInput>
	);
};

export { ChatInput };
