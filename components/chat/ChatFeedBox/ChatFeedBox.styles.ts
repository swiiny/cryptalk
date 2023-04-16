import { addTransition } from '@utils/functions';
import styled from 'styled-components';

export const StyledChatFeedBox = styled.li`
	position: relative;

	max-width: 60%;

	${addTransition()}

	overflow: hidden;

	& > div {
		&.is-left {
			width: 100%;
		}

		& > p {
			width: 100%;
			overflow-wrap: break-word;
			hyphens: none;
		}
	}
`;
