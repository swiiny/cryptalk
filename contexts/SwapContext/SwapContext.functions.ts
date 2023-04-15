import { tokens } from '@utils/tokens';
import { ITokensByNetwork } from './SwapContext.type';

// fetch https://api.1inch.io/v5.0/[netowkrId]/tokens
async function getTokens(): Promise<ITokensByNetwork[]> {
	/* const promises = Object.values(ENetwork).map(async (network) => {
		const tokensRes = await axios.get(`https://api.1inch.io/v5.0/${network}/tokens`);
		return {
			network,
			tokens: Object.values(tokensRes.data.tokens)
		};
	});

	const resolvedPromises = await Promise.all(promises);

	return resolvedPromises; */

	// save tokens locally to not overload 1inch API in development
	return tokens;
}

export { getTokens };
