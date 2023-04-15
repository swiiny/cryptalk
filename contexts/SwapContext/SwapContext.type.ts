import { ENetwork } from './SwapContext.enum';

interface IToken {
	symbol: string;
	name: string;
	address: string;
	decimals: number;
	logoURI?: string;
	tags: string[];
	eip2612?: boolean;
	wrappedNative?: boolean;
	synth?: boolean;
	isFoT?: boolean;
	domainVersion?: string;
	displayedSymbol?: string;
}

interface ITokensByNetwork {
	network: ENetwork;
	tokens: IToken[];
}

interface ISwapContext {
	tokens: ITokensByNetwork[];
}

export type { IToken, ISwapContext, ITokensByNetwork };
