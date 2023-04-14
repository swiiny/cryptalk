import { IMargin } from '@interfaces/layout';
import { addMarginStyles } from '@utils/functions';
import styled from 'styled-components';

export const StyledChatFeedBox = styled.li<{ isLeft: boolean } & IMargin>`
	position: relative;

	max-width: 60%;

	${(p) => (p.isLeft ? `margin-right: auto;` : `margin-left: auto;`)}
	${(p) => addMarginStyles(p)}

	& + li {
		margin-top: 2px;
	}
`;
