import { IFormattedSwapData } from '@components/modals/SwapConfirmationModal/SwapConfirmationModal';
import { IWallet } from '@interfaces/wallet';
import Address from '@models/Address';
import { providers } from 'ethers';
import { ENetwork } from './Web3Context.enum';

interface IWeb3 {
	provider: IWeb3Provider;
	address: Address | undefined;
	networkId: number | undefined;
	isWalletConnected: boolean;
	walletName: string | undefined;
	ens: string | undefined;
	isConnectingWallet: boolean;
	isValidNetwork: boolean;
	connectWallet: (wallet: IWallet) => void;
	disconnectWallet: () => void;
	fusionSwap: (swapData: IFormattedSwapData) => Promise<void>;
	approveSpender: (...args: any) => Promise<void>;
	swapAggregator: (...args: any) => Promise<string>;
}

interface IWeb3Provider {
	web3Provider?: providers.Web3Provider;
	web3Instance?: any;
	isWallet?: boolean;
	error?: boolean;
}

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

export type { IWeb3Provider, IWeb3, IToken, ITokensByNetwork };
