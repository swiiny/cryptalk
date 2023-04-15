import { useQuery } from '@tanstack/react-query';
import { createContext, FC } from 'react';
import { getTokens } from './SwapContext.functions';
import { ISwapContext } from './SwapContext.type';

const SwapContext = createContext<ISwapContext | undefined>(undefined);

const SwapContextProvider: FC<{ children: any }> = ({ children }) => {
	const { data: tokens = [] } = useQuery({
		queryKey: ['tokens'],
		queryFn: () => getTokens()
	});

	return (
		<SwapContext.Provider
			value={{
				tokens
			}}
		>
			{children}
		</SwapContext.Provider>
	);
};

export { SwapContextProvider, SwapContext };
