import { FusionSDK } from '@1inch/fusion-sdk';
import { EUser } from '@components/chat/ChatInput/ChatInput';
import { IFormattedSwapData } from '@components/modals/SwapConfirmationModal/SwapConfirmationModal';
import { pushNewMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { IMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery.type';
import MetaMaskSDK from '@metamask/sdk';
import Address from '@models/Address';
import { useQueryClient } from '@tanstack/react-query';
import { ethers, providers } from 'ethers';
import { IWallet } from 'interfaces/wallet';
import { FC, ReactNode, createContext, useCallback, useEffect, useState } from 'react';
import { clearLocalStorage, getLocalStorage, setLocalStorage } from 'utils/global';
import { v4 as uuidv4 } from 'uuid';
import { checkIfNetworkIsValid, getWalletFromName } from './Web3Context.functions';
import { IWeb3, IWeb3Provider } from './Web3Context.type';
import { WALLETS } from './Web3Context.variables';

// the key used to save the state in localStorage
const WalletLocalStorageKey = 'wallet';

export const Web3Context = createContext<IWeb3 | undefined>(undefined);

const mmOptions = {
	useDeeplink: false,
	enableDebug: true,
	rpc: 'https://mainnet.infura.io/v3/',
	infuraId: process.env.INFURA_API_KEY
};

async function wrapNativeToken(wrapTokenAddress: string, amount: string, provider?: providers.Web3Provider) {
	if (!provider) {
		throw new Error('Provider is not defined');
	}
	const signer = provider.getSigner();
	const contract = new ethers.Contract(wrapTokenAddress, ['function wrap() payable'], signer);
	const tx = await contract.wrap({
		value: ethers.utils.parseEther(amount).div(ethers.BigNumber.from(10).pow(18))
	});
	await tx.wait();
}

let MMSDK: MetaMaskSDK;

const defaultProvider = { error: true };
const Web3Provider: FC<{ children: ReactNode }> = ({ children }) => {
	const [provider, setProvider] = useState<IWeb3Provider>({ error: true });
	const [address, setAddress] = useState<Address | undefined>(undefined);
	const [networkId, setNetworkId] = useState<number | undefined>(undefined);
	const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
	const [walletName, setWalletName] = useState<string | undefined>(undefined);
	const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);
	const [isValidNetwork, setIsValidNetwork] = useState<boolean>(false);
	const [ens, setEns] = useState<string | undefined>(undefined);
	const queryClient = useQueryClient();

	const disconnectWallet = useCallback(() => {
		setProvider(defaultProvider);
		setAddress(undefined);
		setEns(undefined);
		setIsWalletConnected(false);
		setWalletName(undefined);

		clearLocalStorage();
	}, []);

	const initWeb3Listeners = useCallback(
		(provider: any) => {
			if (provider) {
				try {
					provider.on('chainChanged', (chainId: number): void => {
						getNetworkId(chainId);
					});

					provider.on('accountsChanged', async (accounts: string[]) => {
						if (accounts.length > 0) {
							setAddress(Address.from(accounts[0]));
						} else {
							// statement called when used disconnects himself from metamask
							disconnectWallet();
						}
					});
				} catch (err) {
					console.error('Error while initializing web3 listeners', err);
				}
			}
		},
		[disconnectWallet]
	);

	const connectWallet = useCallback(
		async (wallet: IWallet) => {
			setIsConnectingWallet(true);

			if (address) {
				console.log('already connected');
				return;
			}

			try {
				switch (wallet.name) {
					case WALLETS.metamask.name:
						console.log('connecting to metamask');
						const ethereum = MMSDK.getProvider();

						const web3provider = new providers.Web3Provider(ethereum);

						const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

						setAddress(Address.from(accounts[0]));

						setProvider({
							web3Provider: web3provider,
							web3Instance: window.ethereum
						});

						initWeb3Listeners(ethereum);

						break;
					default:
						break;
				}

				setLocalStorage(WalletLocalStorageKey, wallet.name);
				setWalletName(wallet.name);
				setIsWalletConnected(true);
				setIsConnectingWallet(false);
			} catch (err) {
				console.error("Couldn't connect to wallet", wallet.name, err);
				setIsConnectingWallet(false);
				disconnectWallet();
			}
		},
		[address, disconnectWallet, initWeb3Listeners]
	);

	const getNetworkId = async (chainId?: number) => {
		try {
			let networkId = chainId;

			if (!networkId) {
				networkId = await window.ethereum?.request({ method: 'eth_chainId' });
			}

			if (networkId) {
				if (`${networkId}`.startsWith('0x')) {
					const intNetworkId = parseInt(`${networkId}`, 16);

					setNetworkId(intNetworkId);
					return;
				}

				setNetworkId(networkId);
			} else {
				console.error("can't get chain id");
				setNetworkId(undefined);
			}
		} catch (err) {
			console.error('Error while getting network id', err);
		}
	};

	const checkIfWalletIsConnected = useCallback(async () => {
		const savedWalletName = getLocalStorage(WalletLocalStorageKey) as string;

		if (savedWalletName) {
			const savedWallet = getWalletFromName(savedWalletName);

			if (savedWallet) {
				connectWallet(savedWallet);
				return 0;
			}

			return 1;
		}

		return 0;
	}, [connectWallet]);

	const checkIfUserHasEns = useCallback(async (address: Address) => {
		if (address) {
			try {
				// get provider from ethers to have the lookupAddress method
				const provider = new ethers.providers.JsonRpcProvider(
					'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY,
					1
				);

				const resolver = await provider?.lookupAddress(address.toString());

				if (resolver) {
					setEns(resolver);
				}
			} catch (err) {
				console.error('Error while getting ENS', err);
			}
		}
	}, []);

	const fusionSwap = useCallback(
		async ({ tokenA, tokenB, amount, minimumReceived, slippage }: IFormattedSwapData) => {
			try {
				if (!address) {
					throw new Error('No address found');
				}

				if (!networkId) {
					throw new Error('No network id found');
				}

				if (tokenA.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
					let wrappedNativeTokenAddress = '';
					// get Wrapped Native
					if (networkId === 137) {
						wrappedNativeTokenAddress = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
					} else if (networkId === 56) {
						wrappedNativeTokenAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
					} else if (networkId === 1) {
						wrappedNativeTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
					}

					// update tokenA address to be the wrapped native token address
					tokenA.address = wrappedNativeTokenAddress;

					// need to wrap
					await wrapNativeToken(wrappedNativeTokenAddress, amount, provider.web3Provider);
				}

				/* const blockchainProvider = new sdk.api.({
					provider: provider.web3Provider
				});
 */

				/* 		{
						fromTokenAddress: '0xbd1463f02f61676d53fd183c2b19282bff93d099',
						toTokenAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
						amount: '267650763756631830',
						walletAddress: '0x344A821f89b71E96B7e2f7af5a42d45b474D041e'
					}
 */
				tokenA.address = '0xbd1463f02f61676d53fd183c2b19282bff93d099';
				tokenB.address = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
				amount = '267650763756631830';

				//const signer = provider?.web3Instance?.getSigner();

				const sdk = new FusionSDK({
					url: 'https://fusion.1inch.io',
					network: networkId,
					blockchainProvider: provider.web3Instance
				});

				const order = await sdk.createOrder({
					fromTokenAddress: tokenA.address,
					toTokenAddress: tokenB.address,

					amount: amount,
					walletAddress: address.toString()
				});

				console.log('order', order);
				/* 
				// Sign the typed data
				const signature = await provider.web3Instance.send('eth_signTypedData_v4', [
					address.toString(),
					JSON.stringify(order)
				]);
 */
				//console.log('signature', signature);

				// Submit the order
				//const submitOrderRes = await sdk.submitOrder(order.order, order.quoteId);
				//console.log('submitOrderRes', submitOrderRes);
				/* 
				order: LimitOrderV3Struct;
				signature: string;
				quoteId: string;
				orderHash: string; */

				/* 				export declare type OrderParams = {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    walletAddress: string;
    permit?: string;
    receiver?: string;
    preset?: PresetEnum;
    nonce?: OrderNonce | string | number;
    fee?: TakingFeeInfo;
};

			 */ //blockchainProvider;
				//httpProvider;

				/* 	console.log('networkId', networkId);

				console.log('debug', { tokenA, tokenB, amount, minimumReceived, slippage });
				sdk
					.placeOrder({
						fromTokenAddress: tokenA.address,
						toTokenAddress: tokenB.address,
						amount: amount,
						walletAddress: address.toString()
					}) */
				/* 
				const res = sdk
					.placeOrder({
						fromTokenAddress: '0xbd1463f02f61676d53fd183c2b19282bff93d099',
						toTokenAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
						amount: '267650763756631830',
						walletAddress: '0x344A821f89b71E96B7e2f7af5a42d45b474D041e'
					}) 
					.then(console.log)
					.catch(console.error);
					*/
			} catch (err) {
				console.error(err);
			}
		},
		[address, networkId, provider.web3Instance, provider.web3Provider]
	);

	useEffect(() => {
		setIsValidNetwork(checkIfNetworkIsValid(networkId || 0));
	}, [networkId]);

	useEffect(() => {
		checkIfWalletIsConnected();
	}, [checkIfWalletIsConnected]);

	useEffect(() => {
		if (address) {
			checkIfUserHasEns(address);
		}
	}, [address, checkIfUserHasEns]);

	useEffect(() => {
		console.debug('address', address?.toString());
	}, [address]);

	useEffect(() => {
		console.debug('networkId', networkId);
	}, [networkId]);

	useEffect(() => {
		console.debug('isValidNetwork', isValidNetwork);
	}, [isValidNetwork]);

	useEffect(() => {
		function pushMessage(user: EUser, message: string) {
			const newMessage: IMessage = {
				id: uuidv4(),
				user,
				value: message,
				timestamp: Date.now()
			};

			pushNewMessage(newMessage, queryClient);
		}

		// wait 3 seconds, if there is no address then send message to connect wallet
		const timeout = setTimeout(() => {
			if (!address) {
				pushMessage(
					EUser.bot,
					'Please connect your wallet to interact with me 🦊\nOnce connected, I will be able to help you to swap tokens 🚀'
				);
			} else {
				// remove last 4 chars from ens
				const formattedEns = ens?.replace(/.{4}$/, '');
				pushMessage(
					EUser.bot,
					`Hey ${
						formattedEns || ''
					} 👋\nI'm here to help you with your crypto needs 🚀\n\nYou can ask me about:\n- Swap tokens\n- List of tokens to swap`
				);
			}
		}, 2000);

		return () => clearTimeout(timeout);
	}, [address, queryClient, ens]);

	useEffect(() => {
		if (address) {
			getNetworkId();
		}
	}, [address]);

	useEffect(() => {
		MMSDK = new MetaMaskSDK(mmOptions);
	}, []);

	return (
		<Web3Context.Provider
			value={{
				provider,
				address,
				networkId,
				isWalletConnected,
				connectWallet,
				disconnectWallet,
				walletName,
				ens,
				isConnectingWallet,
				isValidNetwork,
				fusionSwap
			}}
		>
			{children}
		</Web3Context.Provider>
	);
};

export { Web3Provider };
