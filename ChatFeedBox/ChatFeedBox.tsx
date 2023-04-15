import { GradientContainer } from '@components/shared/GradientContainer/GradientContainer';
import Text from '@components/shared/Text';
import { ETextType } from '@components/shared/Text/Text.enum';
import { ESize } from '@theme/theme.enum';
import { FC, Fragment } from 'react';
import { useTheme } from 'styled-components';
import { StyledChatFeedBox } from './ChatFeedBox.styles';
import { IChatFeedBox } from './ChatFeedBox.type';

const ChatFeedBox: FC<IChatFeedBox> = ({ id, user, value, timestamp }) => {
	const theme = useTheme();

	const isUser = user === 'User';

	const formattedValue = () => {
		if (!value) {
			return <></>;
		}

		const valueWithBreaks = value.replaceAll('\n', '<br />');

		return (
			<>
				{valueWithBreaks?.split('<br />').map((line, index) => {
					return (
						<Fragment key={`line-${index}`}>
							{line}
							<br />
						</Fragment>
					);
				})}
			</>
		);
	};

	return (
		<StyledChatFeedBox className={!isUser ? 'is-left' : 'is-right'}>
			<GradientContainer
				borderRadius={'8px'}
				paddingY={6}
				paddingX={12}
				marginLeft={!isUser ? undefined : 'auto'}
				marginRight={isUser ? undefined : 'auto'}
				width='fit-content'
				background={isUser ? theme.colors.darkGradient : theme.colors.blueGradient}
			>
				<Text type={ETextType.p} size={ESize.l}>
					{formattedValue()}
				</Text>
			</GradientContainer>
		</StyledChatFeedBox>
	);
};

export { ChatFeedBox };
