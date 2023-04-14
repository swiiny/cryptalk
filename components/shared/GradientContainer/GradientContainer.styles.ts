import Flex from '@components/shared/layout/Flex';
import styled, { DefaultTheme, css } from 'styled-components';

export const StyledGradientContainer = styled(Flex)<{ borderRadius: string; background: DefaultTheme['colors'] }>`
	${(p) => css`
		position: relative;

		border-radius: ${p.borderRadius || '13px'};
		background: ${p.background || p.theme.colors.darkGradient};
		border: 1px solid ${p.theme.colors.darkGray};
		box-shadow: 0px 5px 20px 10px ${p.theme.colors.black + '50'};
	`}
`;
