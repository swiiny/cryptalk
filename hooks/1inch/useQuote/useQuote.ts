import { FusionSDK } from '@1inch/fusion-sdk';
import useWeb3 from '@hooks/useWeb3';
import { tokens } from '@utils/tokens';
import axios from 'axios';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

async function fetchQuote(fromTokenAddress?: string, toTokenAddress?: string, amount?: string, networkId?: number) {
	if (!amount) {
		throw new Error('Amount is required');
	}

	if (!networkId) {
		throw new Error('Network ID is required');
	}

	if (!fromTokenAddress) {
		throw new Error('From token address is required');
	}

	if (!toTokenAddress) {
		throw new Error('To token address is required');
	}

	if (fromTokenAddress === toTokenAddress) {
		return { fromTokenAmount: amount, toTokenAmount: amount };
	}
	const { data } = await axios.get(
		`https://api.1inch.exchange/v5.0/${networkId}/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}`
	);

	return data;
}

export interface IQuote {
	fromTokenAmount?: string;
	toTokenAmount?: string;
	fromTokenAmountInUSD?: string;
	toTokenAmountInUSD?: string;
	readableFromTokenAmount?: string;
	readableToTokenAmount?: string;
}

export function useQuote(fromTokenAddress?: string, toTokenAddress?: string, amount?: string) {
	const { provider, networkId } = useWeb3();
	const [quote, setQuote] = useState<IQuote>({});

	const getQuote = useCallback(async () => {
		try {
			if (!provider || !networkId || !fromTokenAddress || !toTokenAddress || !amount) {
				return {};
			}
			const sdk = new FusionSDK({
				url: 'https://fusion.1inch.io',
				network: networkId,
				blockchainProvider: provider.web3Instance
			});

			const quote = await sdk.getQuote({
				fromTokenAddress,
				toTokenAddress,
				amount
			});

			const allTokens = tokens.flatMap((token) => token.tokens);
			const fromToken = allTokens.find((token) => token.address === fromTokenAddress);
			const toToken = allTokens.find((token) => token.address === toTokenAddress);

			let readableFromTokenAmount = '0';
			let readableToTokenAmount = '0';

			if (fromToken) {
				readableFromTokenAmount = ethers.utils.formatUnits(quote.fromTokenAmount, fromToken.decimals);
			}

			if (toToken) {
				readableToTokenAmount = ethers.utils.formatUnits(quote.toTokenAmount, toToken.decimals);
			}

			return {
				fromTokenAmount: quote.fromTokenAmount,
				readableFromTokenAmount,
				toTokenAmount: quote.toTokenAmount,
				readableToTokenAmount,
				fromTokenAmountInUSD: quote.prices.usd.fromToken,
				toTokenAmountInUSD: quote.prices.usd.toToken
			};
		} catch (error) {
			console.log('error', error);
			return {};
		}
	}, [amount, fromTokenAddress, networkId, provider, toTokenAddress]);

	useEffect(() => {
		async function _getQuote() {
			const quote = await getQuote();
			setQuote(quote);
		}

		_getQuote();
	}, [getQuote]);

	return quote;
}
