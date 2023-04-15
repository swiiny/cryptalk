import { TSwapData } from '@components/chat/ChatInput/ChatInput.type';

interface ISwapConfirmationModal {
	isOpen: boolean;
	onClose: () => void;
	swapData: TSwapData;
}

export type { ISwapConfirmationModal };
