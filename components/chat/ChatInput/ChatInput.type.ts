import { IMessage } from '../ChatContainer/ChatContainer.type';

interface IChatInput {
	onSend: (message: IMessage) => void;
}

export type { IChatInput };
