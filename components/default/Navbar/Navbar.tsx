import Text from '@components/default/Text';
import { ETextType } from '@components/default/Text/Text.enum';
import Flex from '@components/layout/Flex';
import { EMediaQuery, ESize } from 'theme/theme.enum';
import WalletButton from '../WalletButton';
import { StyledNavbar } from './Navbar.styles';

const Navbar = () => {
	return (
		<StyledNavbar>
			<Text type={ETextType.h1} size={ESize.s} hiddenRange={[EMediaQuery.sm, undefined]}>
				Cryptalk
			</Text>

			<Flex>
				<WalletButton />
			</Flex>
		</StyledNavbar>
	);
};

export { Navbar };
