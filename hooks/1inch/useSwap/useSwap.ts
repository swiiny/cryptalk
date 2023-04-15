import { IToken } from '@contexts/SwapContext/SwapContext.type';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function useSwap(
	onSuccess: (data: any) => void,
	isNative: boolean,
	network?: number,
	allowance?: string,
	fromTokenAddress?: IToken['address'],
	toTokenAddress?: IToken['address'],
	amount?: string,
	userAddress?: string,
	slippage?: number
) {
	return useQuery({
		queryKey: ['swap', fromTokenAddress, toTokenAddress, amount, userAddress, slippage],
		queryFn: async () => {
			const response = await axios.get(
				`https://api.1inch.exchange/v5.0/${network}/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}&fromAddress=${userAddress}&slippage=${slippage}`
			);
			return response.data;
		},
		onSuccess,
		enabled:
			!!fromTokenAddress &&
			!!allowance &&
			!!toTokenAddress &&
			!!amount &&
			(isNative || parseInt(allowance) < parseInt(amount)) &&
			!!userAddress &&
			!!slippage &&
			!!network
	});
}

export { useSwap };
