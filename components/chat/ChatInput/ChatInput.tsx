import { useOpenAIMutation } from '@hooks/chat/useOpenAIMutation/useOpenAIMutation';
import { FC, useState } from 'react';
import { StyledChatInput } from './ChatInput.styles';
import { IChatInput } from './ChatInput.type';

const ChatInput: FC<IChatInput> = () => {
	const { mutate: sendMessage } = useOpenAIMutation();

	const [inputValue, setInputValue] = useState<string>('');

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	return (
		<StyledChatInput>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					sendMessage('test');
				}}
			>
				<input type='text' />
				<button type='submit'>Send</button>
			</form>
		</StyledChatInput>
	);
};

export { ChatInput };
