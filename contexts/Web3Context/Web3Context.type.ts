import { IFormattedSwapData } from '@components/modals/SwapConfirmationModal/SwapConfirmationModal';
import { IWallet } from '@interfaces/wallet';
import Address from '@models/Address';
import { providers } from 'ethers';

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
}

interface IWeb3Provider {
	web3Provider?: providers.Web3Provider;
	web3Instance?: any;
	isWallet?: boolean;
	error?: boolean;
}

export type { IWeb3Provider, IWeb3 };
