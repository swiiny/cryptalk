import { EMediaQuery } from '@theme/theme.enum';
import { mq } from '@utils/functions';
import styled, { css } from 'styled-components';

export const StyledChatInput = styled.div(
	(p) => css`
		position: relative;

		width: 100%;

		display: flex;
		justify-content: center;
		align-items: center;

		& > form {
			width: 100%;
			height: 100%;
			background-color: ${p.theme.colors.darkGray};

			border-radius: ${p.theme.spacing['2xs']};
			border: 1px solid ${p.theme.colors.gray}50;

			padding: 6px 16px;

			box-shadow: 0px 5px 20px 10px ${p.theme.colors.black + '50'};

			& > input {
				width: 80%;
				background-color: transparent;

				border: none;

				font-size: 1rem;

				${mq(EMediaQuery.md, 'font-size: 1.2rem;')}

				padding: 12px 0px;

				cursor: text;

				// deactivate focus outline
				outline: none;

				&::placeholder {
					color: ${p.theme.colors.gray};
				}
			}

			& > button {
				width: 20%;
			}
		}
	`
);
