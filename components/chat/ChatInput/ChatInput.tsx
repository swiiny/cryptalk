import { SwapConfirmationModal } from '@components/modals/SwapConfirmationModal/SwapConfirmationModal';
import { Button } from '@components/shared/Button/Button';
import { useDialogFlowMutation } from '@hooks/chat/useDialogFlowMutation/useDialogFlowMutation';
import { pushNewMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { IMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery.type';
import { useWeb3 } from '@hooks/useWeb3/useWeb3';
import { useQueryClient } from '@tanstack/react-query';
import { FC, FormEvent, useState } from 'react';
import { useTheme } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { StyledChatInput } from './ChatInput.styles';
import { IChatInput, TSwapData } from './ChatInput.type';

export enum EUser {
	bot = 'GPT-3',
	user = 'User'
}

const ChatInput: FC<IChatInput> = () => {
	const queryClient = useQueryClient();
	const theme = useTheme();
	const [message, setMessage] = useState('');
	const { address, setIsWalletModalOpen } = useWeb3();
	//const [swapData, setSwapData] = useState<TSwapData>({});
	const [swapData, setSwapData] = useState<TSwapData>({
		tokenA: 'USDC',
		tokenB: 'ETH',
		amount: 1000,
		slippage: 3,
		isReadyToSwap: true
	});
	//const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
	const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(true);

	//const openAIMutation = useOpenAIMutation();
	//const [inputType, setInputType] = useState<EInputType>(EInputType.selectAction);
	const { mutate } = useDialogFlowMutation();

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
		SpecifyTokenAAmountAndTokenB = 'SpecifyTokenAAmountAndTokenB'
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutate(
			{ message, sessionId: address?.toString() || 'unknown' },
			{
				onSuccess: (data) => {
					const _intent = data.intent.displayName;
					const parameters = data.parameters.fields;

					const answer = data.fulfillmentText;

					console.log('parameters', parameters);

					switch (_intent) {
						case EIndent.SwapTokens:
							console.log('user wants to swap');
							pushMessage(EUser.bot, answer);
							break;
						case EIndent.Slippage:
							console.log('user wants to set slippage');
							setSwapData({ ...swapData, slippage: parameters.slippage.numberValue, isReadyToSwap: true });
							pushMessage(EUser.bot, answer.replaceAll('[slippage]', parameters.slippage.numberValue.toString()));

							/* setTimeout(() => {
								pushMessage(
									EUser.bot,
									`You want to swap ${swapData.amount} ${swapData.tokenA} for ${swapData.tokenB} with a slippage of ${parameters.slippage.numberValue}%`
								);
							}, 500); */
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
							// show tokenlist
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
						default:
							break;
					}
				}
			}
		);

		setMessage('');
	};

	/* 	useEffect(() => {
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

	return (
		<>
			<SwapConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={() => setConfirmationModalOpen(false)}
				swapData={swapData}
			/>

			<StyledChatInput>
				{!address ? (
					<Button
						width={'100%'}
						onClick={() => setIsWalletModalOpen(true)}
						gradientContainerProps={{
							background: theme.colors.darkGradient
						}}
					>
						Connect Wallet
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
