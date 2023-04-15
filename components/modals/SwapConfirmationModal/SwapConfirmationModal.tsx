import Button from '@components/shared/Button';
import Portal from '@components/shared/Portal';
import { Text } from '@components/shared/Text/Text';
import { ETextAlign, ETextType } from '@components/shared/Text/Text.enum';
import { Flex } from '@components/shared/layout/Flex/Flex';
import { EFlex } from '@components/shared/layout/Flex/Flex.enum';
import { ENetwork } from '@contexts/SwapContext/SwapContext.enum';
import { IToken } from '@contexts/SwapContext/SwapContext.type';
import { useQuote } from '@hooks/1inch/useQuote/useQuote';
import useWeb3 from '@hooks/useWeb3';
import { useQueryClient } from '@tanstack/react-query';
import { tokens } from '@utils/tokens';
import { ethers } from 'ethers';
import { FC, MouseEvent, useEffect, useId, useMemo, useState } from 'react';
import { useTheme } from 'styled-components';
import { ESize } from 'theme/theme.enum';
import GradientContainer from '../../shared/GradientContainer';
import { StyledModalBackground } from './SwapConfirmationModal.styles';
import { ISwapConfirmationModal } from './SwapConfirmationModal.type';

const networks = Object.values(ENetwork).map((network) => Number(network));

interface IFormattedSwapData {
	tokenA: IToken;
	tokenB: IToken;
	amount: string;
	minimumReceived: string;
	slippage: string;
}

const SwapConfirmationModal: FC<ISwapConfirmationModal> = ({ isOpen = false, onClose = () => {}, swapData }) => {
	const queryClient = useQueryClient();
	const { networkId, fusionSwap } = useWeb3();
	const { tokenA: tokenASymbol, tokenB: tokenBSymbol, amount, slippage } = swapData;
	const [formattedSwapData, setFormattedSwapData] = useState<IFormattedSwapData>();
	const theme = useTheme();

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const isValidNetwork = networks.includes(networkId || 0);

	const { isLoading, fromTokenAmount, toTokenAmount } = useQuote(
		formattedSwapData?.tokenA.address,
		formattedSwapData?.tokenB.address,
		formattedSwapData?.amount,
		networkId
	);

	console.log('swapQuote', isLoading, fromTokenAmount, toTokenAmount);

	const uuid = useId();

	const formattedToAmount = useMemo(() => {
		let _amount = ethers.utils.formatUnits(toTokenAmount || '0', formattedSwapData?.tokenB.decimals);

		// let 6 decimals
		_amount = _amount.slice(0, _amount.indexOf('.') + 7);

		// remove trailing zeros
		return _amount.replace(/\.?0+$/, '');
	}, [toTokenAmount, formattedSwapData?.tokenB.decimals]);

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
				console.error('token not found');
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
				slippage: formattedSlippage + '%'
			});
		} catch {}
	}, [amount, isValidNetwork, networkId, slippage, tokenASymbol, tokenBSymbol]);

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
					<Text type={ETextType.p} size={ESize.s} align={ETextAlign.left}>{`Powered by 1Inch Fusion API`}</Text>

					<Text type={ETextType.h4} align={ETextAlign.left} marginTop={ESize.xs}>{`Rate`}</Text>
					<Text
						type={ETextType.p}
						size={ESize.l}
						align={ETextAlign.left}
					>{`${amount} ${tokenASymbol} → ${formattedToAmount} ${tokenBSymbol}`}</Text>

					<Flex width={'100%'} marginTop={ESize.m} direction={EFlex.columnReverse} mdDirection={EFlex.row} gap={'16px'}>
						<Button
							width={'100%'}
							mdWidth={'50%'}
							// onClick={() => setSwapData({})}
						>
							Cancel
						</Button>
						<Button
							width={'100%'}
							mdWidth={'50%'}
							//onClick={() => setConfirmationModalOpen(true)}
							gradientContainerProps={{
								background: theme.colors.success
							}}
						>
							Swap
						</Button>
					</Flex>
				</GradientContainer>
			</StyledModalBackground>
		</Portal>
	);
};

export { SwapConfirmationModal };
