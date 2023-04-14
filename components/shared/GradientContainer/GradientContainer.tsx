import { FC } from 'react';
import { StyledGradientContainer } from './GradientContainer.styles';
import { IGradientContainer } from './GradientContainer.type';

const GradientContainer: FC<IGradientContainer> = ({ children, borderRadius, background, ...otherProps }) => {
	return (
		<StyledGradientContainer borderRadius={borderRadius} background={background} {...otherProps}>
			{children}
		</StyledGradientContainer>
	);
};

export { GradientContainer };
