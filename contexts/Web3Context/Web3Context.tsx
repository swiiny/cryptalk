import { EUser } from '@components/chat/ChatInput/ChatInput';
import { TSwapData } from '@components/chat/ChatInput/ChatInput.type';
import { ENetwork } from '@contexts/SwapContext/SwapContext.enum';
import { pushNewMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery';
import { IMessage } from '@hooks/chat/useMessagesQuery/useMessagesQuery.type';
import MetaMaskSDK from '@metamask/sdk';
import Address from '@models/Address';
import { useQueryClient } from '@tanstack/react-query';
import { tokens } from '@utils/tokens';
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
				if (`${chainId}`.startsWith('0x')) {
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
		async ({ tokenA: tokenASymbol, tokenB: tokenBSymbol, amount, slippage }: TSwapData) => {
			try {
				const tokensForUserNetwork = tokens.find(({ network }) => `${network}` === `${networkId}`);

				if (!tokensForUserNetwork) {
					const supprotedNetworks = Object.keys(ENetwork)
						.map((key) => {
							// capitalize first letter
							return '- ' + key.charAt(0).toUpperCase() + key.slice(1);
						})
						.join('\n');

					const newMessage: IMessage = {
						id: uuidv4(),
						user: EUser.bot,
						value: `Please connect your wallet to one of the supported networks\n${supprotedNetworks}`,
						timestamp: Date.now()
					};

					pushNewMessage(newMessage, queryClient);
					return;
				}

				const _tokenA = tokensForUserNetwork?.tokens.find(
					({ symbol }) => symbol.toLowerCase() === tokenASymbol?.toLowerCase()
				);
				const _tokenB = tokensForUserNetwork?.tokens.find(
					({ symbol }) => symbol.toLowerCase() === tokenBSymbol?.toLowerCase()
				);

				console.log('tokens to swap', _tokenA, _tokenB);
			} catch (err) {
				console.error('buildTx', err);
			}
		},
		[networkId, queryClient]
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
