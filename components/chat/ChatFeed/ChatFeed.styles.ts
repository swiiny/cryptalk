import styled from 'styled-components';

export const StyledChatFeed = styled.ul`
	position: relative;
	width: 100%;

	max-height: calc(100% - 32px);
	margin-bottom: 32px;

	overflow-y: auto;

	display: flex;
	flex-direction: column;
	justify-content: flex-end;

	padding: 0;

	& .is-left {
		margin-right: auto;
		margin-top: 4px;
	}

	& .is-right {
		margin-left: auto;
		margin-top: 4px;
	}

	// if two li's in a row doesn't have the same class, add margin
	& .is-left + .is-right {
		margin-top: 16px;
	}

	& .is-right + .is-left {
		margin-top: 16px;
	}
`;
