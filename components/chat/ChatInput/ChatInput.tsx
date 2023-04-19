import { SwapConfirmationModal } from '@components/modals/SwapConfirmationModal/SwapConfirmationModal';
import { Button } from '@components/shared/Button/Button';
import { ENetwork } from '@contexts/Web3Context/Web3Context.enum';
import { WALLETS } from '@contexts/Web3Context/Web3Context.variables';
import { useDialogFlowMutation } from '@hooks/chat/useDialogFlowMutation/useDialogFlowMutation';
import { pushNewMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { IMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery.type';
import { useWeb3 } from '@hooks/useWeb3/useWeb3';
import { useQueryClient } from '@tanstack/react-query';
import { tokens } from '@utils/tokens';
import { FC, FormEvent, useState } from 'react';
import { useTheme } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { StyledChatInput } from './ChatInput.styles';
import { IChatInput, TSwapData } from './ChatInput.type';

export enum EUser {
	bot = 'dialogflow',
	user = 'User'
}

const ChatInput: FC<IChatInput> = () => {
	const queryClient = useQueryClient();
	const theme = useTheme();
	const [message, setMessage] = useState('');
	const { address, connectWallet } = useWeb3();
	const [swapData, setSwapData] = useState<TSwapData>({});
	const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
	const { mutate: mutateDialogFlow } = useDialogFlowMutation();

	/* useEffect(() => {
		if (address) {
			setSwapData({
				tokenA: 'WMATIC',
				tokenB: 'USDC',
				amount: 0.1,
				slippage: 2,
				isReadyToSwap: true
			});

			setConfirmationModalOpen(true);
		}
	}, [address]); */

	function pushMessage(user: EUser, message: string) {
		const newMessage: IMessage = {
			id: uuidv4(),
			user,
			value: message,
			timestamp: Date.now()
		};

		pushNewMessage(newMessage, queryClient);
	}

	enum EIndent {
		SwapTokens = 'SwapTokens',
		Slippage = 'Slippage',
		SpecifyAmount = 'SpecifyAmount',
		TokenA = 'TokenA',
		TokenB = 'TokenB',
		SpecifyTokens = 'SpecifyTokens',
		AvailableTokens = 'AvailableTokens',
		SpecifyNetwork = 'SpecifyNetwork',
		SpecifyTokenAAmountAndTokenB = 'SpecifyTokenAAmountAndTokenB'
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutateDialogFlow(
			{ message, sessionId: address?.toString() || 'unknown' },
			{
				onSuccess: (data) => {
					const _intent = data.intent.displayName;
					const parameters = data.parameters.fields;

					const answer = data.fulfillmentText;

					switch (_intent) {
						case EIndent.SwapTokens:
							console.log('user wants to swap');
							pushMessage(EUser.bot, answer);
							break;
						case EIndent.Slippage:
							console.log('user wants to set slippage');
							setSwapData({ ...swapData, slippage: parameters.slippage.numberValue, isReadyToSwap: true });
							pushMessage(EUser.bot, answer.replaceAll('[slippage]', parameters.slippage.numberValue.toString()));

							setTimeout(() => {
								setConfirmationModalOpen(true);
							}, 500);

							break;
						case EIndent.SpecifyAmount:
							console.log('user wants to specify amount');
							setSwapData({ ...swapData, amount: parameters.amount.numberValue });
							pushMessage(
								EUser.bot,
								answer
									.replaceAll('[amount]', parameters.amount.numberValue.toString())
									.replaceAll('[tokenA]', swapData.tokenA || 'tokens')
							);
							break;
						case EIndent.TokenA:
							console.log('user wants to specify token A');
							setSwapData({ ...swapData, tokenA: parameters.tokenA.stringValue });
							pushMessage(EUser.bot, answer.replaceAll('[tokenA]', parameters.tokenA.stringValue));
							break;
						case EIndent.TokenB:
							console.log('user wants to specify token B');
							setSwapData({ ...swapData, tokenB: parameters.tokenB.stringValue });
							pushMessage(EUser.bot, answer.replaceAll('[tokenB]', parameters.tokenB.stringValue));
							break;
						case EIndent.SpecifyTokens:
							console.log('user wants to specify tokens');
							setSwapData({
								...swapData,
								tokenA: parameters.tokenA.stringValue,
								tokenB: parameters.tokenB.stringValue
							});

							pushMessage(
								EUser.bot,
								answer
									.replaceAll('[tokenA]', parameters.tokenA.stringValue)
									.replaceAll('[tokenB]', parameters.tokenB.stringValue)
							);
							break;
						case EIndent.AvailableTokens:
							console.log('user wants to see available tokens');
						case EIndent.SpecifyNetwork:
							const networkKey = parameters?.network?.stringValue;

							if (!networkKey) {
								pushMessage(EUser.bot, "Sorry, I can't find this network.");
								return;
							}

							const matchingNetwork = ENetwork[networkKey as keyof typeof ENetwork];

							if (!matchingNetwork) {
								pushMessage(EUser.bot, "Sorry, I can't find this network.");
								return;
							}

							const tokensForNetwork =
								tokens.find((token) => token.network === matchingNetwork)?.tokens?.map(({ symbol }) => symbol) || [];

							if (tokensForNetwork.length === 0) {
								pushMessage(EUser.bot, "Sorry, I can't find any tokens for this network.");
								return;
							}

							pushMessage(
								EUser.bot,
								answer
									.replaceAll('[network]', networkKey)
									.replaceAll('[availableTokens]', '\n- ' + tokensForNetwork.join('\n- ') + '\n\n')
							);

							break;
						case EIndent.SpecifyTokenAAmountAndTokenB:
							console.log('user wants to specify token A amount and token B');
							setSwapData({
								...swapData,
								tokenA: parameters.tokenA.stringValue,
								tokenB: parameters.tokenB.stringValue,
								amount: parameters.amount.numberValue
							});

							pushMessage(
								EUser.bot,
								answer
									.replaceAll('[tokenA]', parameters.tokenA.stringValue)
									.replaceAll('[tokenB]', parameters.tokenB.stringValue)
									.replaceAll('[amount]', parameters.amount.numberValue.toString())
							);
							break;
						default:
							if (answer) {
								pushMessage(EUser.bot, answer);
							}
							break;
					}
				}
			}
		);

		setMessage('');
	};

	/* 	useEffect(() => { // used to generate dialogflow entities
		function formatTokensToEntity() {
			const newEntities = tokens.flatMap((token) => {
				return token.tokens.map((_token) => {
					return {
						value: _token.symbol,
						synonyms: [_token.symbol, _token.name]
					};
				});
			});
			// remove duplicates (property to check: value)
			const uniqueEntities = newEntities.filter(
				(thing, index, self) => index === self.findIndex((t) => t.value === thing.value)
			);
			console.log(uniqueEntities);
			console.log(uniqueEntities.length);
			console.log(newEntities.length);
		}
		formatTokensToEntity();
	}, []); */

	function onCloseModal() {
		setConfirmationModalOpen(false);
		setSwapData({});
	}

	return (
		<>
			<SwapConfirmationModal isOpen={isConfirmationModalOpen} onClose={() => onCloseModal()} swapData={swapData} />

			<StyledChatInput>
				{!address ? (
					<Button
						width={'100%'}
						onClick={() => connectWallet(WALLETS.metamask)}
						gradientContainerProps={{
							background: theme.colors.darkGradient
						}}
					>
						Connect Wallet 🦊
					</Button>
				) : (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (message.length) {
								pushMessage(EUser.user, message);
								handleSubmit(e);
							}
						}}
					>
						<input
							id='chat-input'
							type='text'
							min={1}
							max={50}
							placeholder='I want to swap tokens...'
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<Button
							disabled={message.length < 1}
							type='submit'
							gradientContainerProps={{
								background: message.length > 1 ? theme.colors.success : theme.colors.darkGradient
							}}
						>
							Send
						</Button>
					</form>
				)}
			</StyledChatInput>
		</>
	);
};

export { ChatInput };
