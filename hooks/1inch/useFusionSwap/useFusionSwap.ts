import { EIP712DomainType, FusionSDK, Web3ProviderConnector } from '@1inch/fusion-sdk';
import { RelayerRequest, RelayerRequestParams } from '@1inch/fusion-sdk/api';
import { IToken } from '@contexts/Web3Context/Web3Context.type';
import { useWeb3 } from '@hooks/useWeb3/useWeb3';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ethers, providers } from 'ethers';

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

async function unwrapNativeToken(wrapTokenAddress: string, amount: string, provider?: providers.Web3Provider) {
	if (!provider) {
		throw new Error('Provider is not defined');
	}

	const signer = provider.getSigner();
	const contract = new ethers.Contract(wrapTokenAddress, ['function unwrap(uint256)'], signer);
	const tx = await contract.unwrap(ethers.utils.parseEther(amount).div(ethers.BigNumber.from(10).pow(18)));

	await tx.wait();
}

function getWrappedAddressIfNecessary(tokenAAddress: string, networkId?: number): string | null {
	if (tokenAAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
		let wrappedNativeTokenAddress = '';
		// get Wrapped Native
		if (networkId === 137) {
			wrappedNativeTokenAddress = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
		} else if (networkId === 56) {
			wrappedNativeTokenAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
		} else if (networkId === 1) {
			wrappedNativeTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
		}

		return wrappedNativeTokenAddress;
	}

	return null;
}

// function from @wagmi/core package
export async function signTypedData({ domain, types, value, provider }): Promise<any> {
	const signer = provider.getSigner();
	if (!signer) throw new Error('Signer is not defined');

	const types_ = Object.entries(types)
		.filter(([key]) => key !== 'EIP712Domain')
		.reduce((types, [key, attributes]) => {
			types[key] = attributes.filter((attr) => attr.type !== 'EIP712Domain');
			return types;
		}, {} as Record<string, string[]>);

	try {
		// Method name may be changed in the future, see https://docs.ethers.io/v5/api/signer/#Signer-signTypedData
		return await signer._signTypedData(domain, types_, value);
	} catch (error) {
		throw error;
	}
}

function useFusionSwap() {
	const { address, networkId, provider, isValidNetwork } = useWeb3();

	const { data: spenderData } = useQuery({
		queryKey: ['spender', networkId],
		queryFn: async () => {
			const response = await axios.get(`https://api.1inch.io/v5.0/${networkId}/approve/spender`);
			return response.data;
		},
		staleTime: 24 * 60 * 60 * 1000,
		enabled: !!networkId
	});

	const spenderAddress = spenderData?.address;

	const executeFusionSwap = async (tokenA?: IToken, tokenB?: IToken, amount?: string | null) => {
		try {
			if (!networkId) throw new Error('Network is not defined');
			if (!isValidNetwork) throw new Error('Network is not supported');
			if (!provider.web3Provider) throw new Error('Provider is not defined');
			if (!address) throw new Error('Address is not defined');
			if (!spenderAddress) throw new Error('Spender address is not defined');
			if (!tokenA) throw new Error('TokenA is not defined');
			if (!tokenB) throw new Error('TokenB is not defined');
			if (!amount) throw new Error('Amount is not defined');

			const sdk = new FusionSDK({
				url: 'https://fusion.1inch.io',
				network: networkId,
				//blockchainProvider: new Web3ProviderConnector(new web3(rpcUrl))
				blockchainProvider: new Web3ProviderConnector(provider.web3Provider)
			});

			const wrappedTokenAddress = getWrappedAddressIfNecessary(tokenA.address, networkId);

			if (wrappedTokenAddress) {
				// push a message indicating that user need to wrap native token

				// need to wrap
				await wrapNativeToken(wrappedTokenAddress, amount, provider.web3Provider);

				tokenA.address = wrappedTokenAddress;
			}
			// log readable amount
			//console.log('Readable Amount: ', ethers.utils.parseUnits(amount, tokenA.decimals).toString());

			const { order, quoteId } = await sdk.createOrder({
				fromTokenAddress: tokenA.address,
				toTokenAddress: tokenB.address,
				//amount: (amount * 10 ** tokenA.decimals).toString(),
				amount,
				walletAddress: address.toString()
			});

			const orderStruct = order.build();

			const domain: EIP712DomainType = {
				name: '1inch Aggregation Router',
				version: '5',
				chainId: networkId,
				verifyingContract: spenderAddress
			};

			const domainForEthers = {
				name: '1inch Aggregation Router',
				version: '5',
				chainId: networkId,
				verifyingContract: spenderAddress
			};

			const signTypes = {
				Order: [
					{ name: 'salt', type: 'uint256' },
					{ name: 'makerAsset', type: 'address' },
					{ name: 'takerAsset', type: 'address' },
					{ name: 'maker', type: 'address' },
					{ name: 'receiver', type: 'address' },
					{ name: 'allowedSender', type: 'address' },
					{ name: 'makingAmount', type: 'uint256' },
					{ name: 'takingAmount', type: 'uint256' },
					{ name: 'offsets', type: 'uint256' },
					{ name: 'interactions', type: 'bytes' }
				]
			};

			const parsedTypedData = order.getTypedData(domain);

			const signature = await signTypedData({
				domain: domainForEthers,
				types: signTypes,
				value: parsedTypedData.message,
				provider: provider.web3Provider
			});

			const relayerRequest: RelayerRequest = {
				order: orderStruct,
				signature,
				quoteId,
				build: function (): RelayerRequestParams {
					throw new Error('Function not implemented.');
				}
			};

			const result = await sdk.api.submitOrder(relayerRequest);
			console.log(result);
		} catch (err) {
			console.error('fusionSwap', err);
		}
	};

	return {
		executeFusionSwap
	};
}

export { useFusionSwap };
