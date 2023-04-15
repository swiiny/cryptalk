import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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

export function useQuote(fromTokenAddress?: string, toTokenAddress?: string, amount?: string, networkId?: number) {
	console.log({ fromTokenAddress, toTokenAddress, amount, networkId });

	const { data, isLoading, isError } = useQuery({
		queryKey: [fromTokenAddress, toTokenAddress, amount, networkId],
		queryFn: () => fetchQuote(fromTokenAddress, toTokenAddress, amount, networkId),
		enabled: !!(fromTokenAddress && toTokenAddress && amount && networkId),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false,
		staleTime: 5,
		refetchInterval: process.env.NODE_ENV === 'development' ? undefined : 1000 * 10
	});

	return {
		isLoading,
		isError,
		fromTokenAmount: data?.fromTokenAmount,
		//fromTokenAmountInUSD: data?.fromTokenAmountInUSD,
		toTokenAmount: data?.toTokenAmount
	};
}
