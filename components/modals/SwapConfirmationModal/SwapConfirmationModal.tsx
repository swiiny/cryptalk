import { EUser } from '@components/chat/ChatInput/ChatInput';
import Button from '@components/shared/Button';
import GradientContainer from '@components/shared/GradientContainer';
import Portal from '@components/shared/Portal';
import { Text } from '@components/shared/Text/Text';
import { ETextAlign, ETextType } from '@components/shared/Text/Text.enum';
import Flex from '@components/shared/layout/Flex';
import { EFlex } from '@components/shared/layout/Flex/Flex.enum';
import { ENetwork } from '@contexts/SwapContext/SwapContext.enum';
import { IToken } from '@contexts/SwapContext/SwapContext.type';
import { NETWORK_EXPLORER } from '@contexts/Web3Context/Web3Context.variables';
import useAllowance from '@hooks/1inch/useAllowance';
import { useQuoteAggregator } from '@hooks/1inch/useQuoteAggergator/useQuoteAggregator';
import useSwap from '@hooks/1inch/useSwap';
import { pushNewMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { IMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery.type';
import useWeb3 from '@hooks/useWeb3';
import { useQueryClient } from '@tanstack/react-query';
import { ESize } from '@theme/theme.enum';
import { tokens } from '@utils/tokens';
import { ethers } from 'ethers';
import { FC, MouseEvent, useEffect, useId, useState } from 'react';
import { useTheme } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { StyledModalBackground } from './SwapConfirmationModal.styles';
import { ISwapConfirmationModal } from './SwapConfirmationModal.type';

const networks = Object.values(ENetwork).map((network) => Number(network));

export interface IFormattedSwapData {
	tokenA: IToken;
	tokenB: IToken;
	amount: string;
	minimumReceived: string;
	slippage: string;
	isReady?: boolean;
}

const SwapConfirmationModal: FC<ISwapConfirmationModal> = ({ isOpen = false, onClose = () => {}, swapData }) => {
	const { networkId, address, approveSpender, swapAggregator } = useWeb3();
	const { tokenA: tokenASymbol, tokenB: tokenBSymbol, amount, slippage } = swapData;
	const [formattedSwapData, setFormattedSwapData] = useState<IFormattedSwapData>();
	const theme = useTheme();
	const queryClient = useQueryClient();
	const [swapError, setSwapError] = useState<string | null>(null);

	const [swapTx, setSwapTx] = useState(null);

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const isValidNetwork = networks.includes(networkId || 0);

	const { fromTokenAmount, toTokenAmount, readableFromTokenAmount, readableToTokenAmount } = useQuoteAggregator(
		networkId,
		formattedSwapData?.tokenA.address,
		formattedSwapData?.tokenB.address,
		formattedSwapData?.amount
	);

	const { isNative, allowance, callData } = useAllowance(
		networkId,
		formattedSwapData?.tokenA.address,
		address?.toString(),
		formattedSwapData?.amount,
		!!swapTx
	);

	useSwap(
		(data: any) => {
			setSwapTx({ ...data.tx, value: formattedSwapData?.amount });
		},
		isNative,
		networkId,
		allowance,
		formattedSwapData?.tokenA.address,
		formattedSwapData?.tokenB.address,
		formattedSwapData?.amount,
		address?.toString(),
		slippage || 1
	);

	/* const {
		fromTokenAmount,
		toTokenAmount,
		fromTokenAmountInUSD,
		toTokenAmountInUSD,
		readableFromTokenAmount,
		readableToTokenAmount
	} = useQuote(formattedSwapData?.tokenA.address, formattedSwapData?.tokenB.address, formattedSwapData?.amount);
 */
	const uuid = useId();

	useEffect(() => {
		if (!isValidNetwork || !slippage || !amount) return;

		try {
			const tokensForUserNetwork = tokens.find(({ network }) => `${network}` === `${networkId}`);

			if (!tokensForUserNetwork) {
				const supprotedNetworks = Object.keys(ENetwork)
					.map((key) => {
						// capitalize first letter
						return '- ' + key.charAt(0).toUpperCase() + key.slice(1);
					})
					.join('\n');

				return;
			}

			const _tokenA = tokensForUserNetwork?.tokens.find(
				({ symbol }) => symbol.toLowerCase() === tokenASymbol?.toLowerCase()
			);
			const _tokenB = tokensForUserNetwork?.tokens.find(
				({ symbol }) => symbol.toLowerCase() === tokenBSymbol?.toLowerCase()
			);

			if (!_tokenA || !_tokenB) {
				onClose();
				console.error('token not found');
				const newMessage: IMessage = {
					id: uuidv4(),
					user: EUser.bot,
					value: `Token not found on this network. Please try again on a different network`,
					timestamp: Date.now()
				};

				pushNewMessage(newMessage, queryClient);
				return;
			}

			const formattedSlippage = (slippage / 100).toFixed(2);

			const formattedAmount: string = ethers.utils.parseUnits(amount.toString(), _tokenA.decimals).toString();

			const formattedMinimumReceived: string = ethers.utils
				.parseUnits((amount * (1 - slippage / 100)).toString(), _tokenB.decimals)
				.toString();

			setFormattedSwapData({
				tokenA: _tokenA,
				tokenB: _tokenB,
				amount: formattedAmount,
				minimumReceived: formattedMinimumReceived,
				slippage: formattedSlippage + '%',
				isReady: true
			});
		} catch {}
	}, [amount, isValidNetwork, networkId, onClose, queryClient, slippage, tokenASymbol, tokenBSymbol]);

	useEffect(() => {
		if (!uuid) {
			return;
		}
		if (isOpen) {
			// @ts-ignore
			clearTimeout(window[`modal-timeout-${uuid}`]);
			setTimeout(() => {
				document.body.style.overflow = 'hidden';
				setIsModalVisible(true);
			}, 10);
		} else {
			// @ts-ignore
			window[`modal-timeout-${uuid}`] = setTimeout(() => {
				document.body.style.overflow = 'visible';
				document.body.style.overflowX = 'hidden';

				setIsModalVisible(false);
			}, 400);
		}
	}, [isOpen, uuid]);

	const closeModal = (e: MouseEvent) => {
		// @ts-ignore
		if (e.target?.getAttribute('class')?.includes('modal-background')) {
			onClose();
		}
	};

	async function executeSwap() {
		const txHash = await swapAggregator(swapTx);

		if (txHash) {
			onClose();

			// @ts-ignore
			const explorerLink = !!networkId ? `${NETWORK_EXPLORER[networkId]}${txHash}` : '';

			const newMessage: IMessage = {
				id: uuidv4(),
				user: EUser.bot,
				value: `You've successfully swapped your tokens!\n\nCheck your transaction on Explorer: ${explorerLink}`,
				timestamp: Date.now()
			};

			pushNewMessage(newMessage, queryClient);
		} else {
			const newMessage: IMessage = {
				id: uuidv4(),
				user: EUser.bot,
				value: `Something went wrong. Please try again later.`,
				timestamp: Date.now()
			};

			pushNewMessage(newMessage, queryClient);
		}
	}

	if (!isOpen && !isModalVisible) {
		return <></>;
	}

	return (
		<Portal selector='body'>
			<StyledModalBackground
				className='modal-background'
				isVisible={isModalVisible && isOpen}
				onClick={(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => closeModal(e)}
			>
				<GradientContainer
					direction={EFlex.column}
					width={500}
					height={'auto'}
					padding={ESize['2xs']}
					mdPadding={ESize.s}
				>
					<Text type={ETextType.h3} align={ETextAlign.left}>{`Swap ${tokenASymbol} to ${tokenBSymbol}`}</Text>
					<Text type={ETextType.p} size={ESize.s} align={ETextAlign.left}>{`Powered by 1Inch`}</Text>

					<Text type={ETextType.h4} align={ETextAlign.left} marginTop={ESize.xs}>{`Rate`}</Text>
					<Text type={ETextType.p} size={ESize.l} align={ETextAlign.left}>
						{`${amount} ${tokenASymbol} → ${readableToTokenAmount} ${tokenBSymbol}`}
					</Text>

					<Flex width={'100%'} marginTop={ESize.m} direction={EFlex.columnReverse} mdDirection={EFlex.row} gap={'16px'}>
						<Button width={'100%'} mdWidth={'50%'} onClick={onClose}>
							Cancel
						</Button>
						{!!callData && !swapTx ? (
							<Button
								width={'100%'}
								mdWidth={'50%'}
								onClick={() => approveSpender(callData)}
								disabled={!formattedSwapData?.isReady}
								gradientContainerProps={{
									background: !!callData ? theme.colors.success : theme.colors.success + '20'
								}}
							>
								Approve {tokenASymbol}
							</Button>
						) : (
							<Button
								width={'100%'}
								mdWidth={'50%'}
								onClick={!!swapTx ? () => executeSwap() : undefined}
								disabled={!formattedSwapData?.isReady}
								gradientContainerProps={{
									background: !!swapTx ? theme.colors.success : theme.colors.success + '20'
								}}
							>
								Swap
							</Button>
						)}
					</Flex>
				</GradientContainer>
			</StyledModalBackground>
		</Portal>
	);
};

export { SwapConfirmationModal };
