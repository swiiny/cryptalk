import { GradientContainer } from '@components/shared/GradientContainer/GradientContainer';
import Text from '@components/shared/Text';
import { ETextType } from '@components/shared/Text/Text.enum';
import { ESize } from '@theme/theme.enum';
import { FC } from 'react';
import { useTheme } from 'styled-components';
import { StyledChatFeedBox } from './ChatFeedBox.styles';
import { IChatFeedBox } from './ChatFeedBox.type';

const ChatFeedBox: FC<IChatFeedBox> = ({ id, user, value, timestamp }) => {
	const theme = useTheme();

	const isUser = user === 'User';

	return (
		<StyledChatFeedBox isLeft={!isUser} marginBottom={24}>
			<GradientContainer
				borderRadius={'6px'}
				paddingY={4}
				paddingX={12}
				marginLeft={!isUser ? undefined : 'auto'}
				marginRight={isUser ? undefined : 'auto'}
				width='fit-content'
				background={isUser ? theme.colors.darkGradient : theme.colors.blueGradient}
			>
				<Text type={ETextType.p} size={ESize.m}>
					{value}
				</Text>
			</GradientContainer>
		</StyledChatFeedBox>
	);
};

export { ChatFeedBox };
