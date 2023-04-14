import styled, { css } from 'styled-components';

export const StyledChatInput = styled.div(
	(p) => css`
		position: relative;

		width: 100%;

		& > form {
			& > input {
				width: 80%;
				background-color: ${p.theme.colors.darkGray};

				border-top-left-radius: ${p.theme.spacing['4xs']};
				border-bottom-left-radius: ${p.theme.spacing['4xs']};
				border: 1px solid ${p.theme.colors.gray}50;

				box-shadow: 0px 5px 20px 10px ${p.theme.colors.black + '50'};

				font-size: 1rem;

				padding: 4px 8px;

				cursor: text;

				&::placeholder {
					color: ${p.theme.colors.gray};
				}
			}

			& > button {
				width: 20%;
				padding: 4px 8px;

				border-top-right-radius: ${p.theme.spacing['4xs']};
				border-bottom-right-radius: ${p.theme.spacing['4xs']};
				border: 1px solid ${p.theme.colors.gray}50;

				box-shadow: 0px 5px 20px 10px ${p.theme.colors.black + '50'};

				background-color: gray;

				font-size: 1rem;

				cursor: pointer;
			}
		}
	`
);
