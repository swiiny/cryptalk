import { INetwork } from '@interfaces/network';
import { IWallet } from '@interfaces/wallet';
import { ENetwork } from './Web3Context.enum';

const WALLETS = {
	metamask: {
		name: 'MetaMask',
		srcLogo: '/assets/logo-metamask-color.svg'
	} as IWallet
};

const WALLETS_ARRAY = Object.values(WALLETS);

const NETWORKS_DATA: any = {
	ethereum: {
		id: 'ethereum',
		name: 'Ethereum',
		ticker: 'ETH',
		rpc: process.env.RPC_ETHEREUM,
		networkId: 1
	} as INetwork,
	polygon: {
		id: 'polygon',
		name: 'Polygon',
		ticker: 'MATIC',
		rpc: process.env.RPC_POLYGON,
		networkId: 137
	} as INetwork,
	bsc: {
		id: 'bsc',
		name: 'Binance Smart Chain',
		ticker: 'BNB',
		rpc: process.env.RPC_BSC,
		networkId: 56
	} as INetwork
};

const NETWORKS_RPC: {
	[x: number]: string;
} = {
	[NETWORKS_DATA.ethereum.networkId]: NETWORKS_DATA.ethereum.rpc,
	[NETWORKS_DATA.bsc.networkId]: NETWORKS_DATA.bsc.rpc,
	[NETWORKS_DATA.polygon.networkId]: NETWORKS_DATA.polygon.rpc
};

export const NETWORK_EXPLORER = {
	[ENetwork.ethereum]: 'https://etherscan.io/tx/',
	[ENetwork.binance]: 'https://bscscan.com/tx/',
	[ENetwork.polygon]: 'https://polygonscan.com/tx/'
};

const VALID_CHAIN_IDS: number[] = (Object.values(NETWORKS_DATA) as INetwork[])
	.map((n: INetwork): number => n.networkId || 0)
	.filter((n: number): boolean => n !== 0);

export { NETWORKS_DATA, VALID_CHAIN_IDS, WALLETS, WALLETS_ARRAY, NETWORKS_RPC };
