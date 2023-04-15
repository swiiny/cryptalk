import { FC } from 'react';
import { IWalletButton } from './WalletButton.type';

import useWeb3 from '@hooks/useWeb3';

import { WALLETS } from '@contexts/Web3Context/Web3Context.variables';
import { useTheme } from 'styled-components';
import Button from '../../shared/Button';

const WalletButton: FC<IWalletButton> = () => {
	const { connectWallet, address, isWalletConnected, ens, disconnectWallet } = useWeb3();
	const theme = useTheme();

	return (
		<>
			<Button
				onClick={!!address ? () => disconnectWallet() : () => connectWallet(WALLETS.metamask)}
				color={isWalletConnected ? theme.colors.lightBlue : theme.colors.white}
			>
				{isWalletConnected ? ens || address?.truncate() : 'Connect Wallet 🦊'}
			</Button>
		</>
	);
};

export { WalletButton };
