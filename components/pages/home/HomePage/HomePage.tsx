import Meta from '@components/common/Meta';
import { FC } from 'react';
import { StyledMainContainer } from './HomePage.styles';
import { IHomePage } from './HomePage.type';

const HomePage: FC<IHomePage> = () => {
	return (
		<>
			<Meta title='Cryptalk' description='' />
			<div>
				<StyledMainContainer>
					<></>
				</StyledMainContainer>

				<footer></footer>
			</div>
		</>
	);
};

export { HomePage };
