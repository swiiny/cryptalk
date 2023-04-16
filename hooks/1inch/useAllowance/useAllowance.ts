import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function useAllowance(
	network?: number,
	tokenAddress?: string,
	ownerAddress?: string,
	amount?: string,
	swapReady?: boolean
) {
	const { data: spenderData } = useQuery({
		queryKey: ['spender', network],
		queryFn: async () => {
			const response = await axios.get(`https://api.1inch.io/v5.0/${network}/approve/spender`);
			return response.data;
		},
		staleTime: 24 * 60 * 60 * 1000,
		enabled: !!network
	});

	const spenderAddress = spenderData?.address;

	const { data: allowanceData } = useQuery({
		queryKey: ['allowance', tokenAddress, ownerAddress, spenderAddress, network],
		queryFn: async () => {
			const response = await axios.get(
				`https://api.1inch.io/v5.0/${network}/approve/allowance?tokenAddress=${tokenAddress}&ownerAddress=${ownerAddress}`
			);
			return response.data;
		},
		enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress && !swapReady,
		refetchInterval: 3000
	});

	const allowance = allowanceData?.allowance;

	const { data: allowanceCallData } = useQuery({
		queryKey: ['allowanceCallData', tokenAddress, network],
		queryFn: async () => {
			const response = await axios.get(
				`https://api.1inch.io/v5.0/${network}/approve/transaction?tokenAddress=${tokenAddress}&amount=${amount}`
			);
			return response.data;
		},
		enabled: !!tokenAddress && !!amount && parseInt(allowance) < parseInt(amount),
		staleTime: 0
	});

	const isNative = tokenAddress?.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

	return {
		isNative,
		allowance,
		callData: isNative ? undefined : allowanceCallData
	};
}

export { useAllowance };
