import { useQuery } from '@tanstack/react-query';
import { tokens } from '@utils/tokens';
import axios from 'axios';
import { ethers } from 'ethers';

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

function getReadableAmounts(
	tokenAAddress?: string,
	tokenBAddress?: string,
	fromTokenAmount?: number,
	toTokenAmount?: number
) {
	if (!tokenAAddress || !tokenBAddress || !fromTokenAmount || !toTokenAmount) {
		return { readableFromTokenAmount: '0', readableToTokenAmount: '0' };
	}

	const allTokens = tokens.flatMap((token) => token.tokens);
	const fromToken = allTokens.find((token) => token.address === tokenAAddress);
	const toToken = allTokens.find((token) => token.address === tokenBAddress);

	let readableFromTokenAmount = '0';
	let readableToTokenAmount = '0';

	if (fromToken) {
		readableFromTokenAmount = ethers.utils.formatUnits(fromTokenAmount, fromToken.decimals);
	}

	if (toToken) {
		readableToTokenAmount = ethers.utils.formatUnits(toTokenAmount, toToken.decimals);
	}

	// keep only 8 decimals and remove trailing zeros
	readableFromTokenAmount = parseFloat(readableFromTokenAmount).toFixed(8);
	readableToTokenAmount = parseFloat(readableToTokenAmount).toFixed(8);

	// remove trailing zeros
	readableFromTokenAmount = parseFloat(readableFromTokenAmount).toString();
	readableToTokenAmount = parseFloat(readableToTokenAmount).toString();

	return { readableFromTokenAmount, readableToTokenAmount };
}

export function useQuoteAggregator(
	networkId?: number,
	fromTokenAddress?: string,
	toTokenAddress?: string,
	amount?: string
) {
	const { data, isLoading, isError } = useQuery({
		queryKey: [fromTokenAddress, toTokenAddress, amount, networkId],
		queryFn: () => fetchQuote(fromTokenAddress, toTokenAddress, amount, networkId),
		enabled: !!(fromTokenAddress && toTokenAddress && amount && networkId),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false,
		staleTime: 1000 * 10,
		refetchInterval: process.env.NODE_ENV === 'development' ? undefined : 1000 * 10
	});

	const { readableFromTokenAmount, readableToTokenAmount } = getReadableAmounts(
		fromTokenAddress,
		toTokenAddress,
		data?.fromTokenAmount,
		data?.toTokenAmount
	);

	return {
		isLoading,
		isError,
		fromTokenAmount: data?.fromTokenAmount,
		toTokenAmount: data?.toTokenAmount,
		readableFromTokenAmount,
		readableToTokenAmount
	};
}
