import Document, { Head, Html, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default function CreateNextjsDappDocument() {
	return (
		<Html lang='en'>
			<Head>
				<link href='https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap' rel='stylesheet' />
				<meta name='application-name' content='Cryptalk' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta name='apple-mobile-web-app-status-bar-style' content='default' />
				<meta name='apple-mobile-web-app-title' content='Create NextJs Dapp' />
				<meta
					name='description'
					content='🤖 User-friendly crypto swaps via intuitive conversational interface. #ETHTokyo2023 #Cryptalk'
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

// @ts-ignore
CreateNextjsDappDocument.getInitialProps = async (ctx) => {
	const sheet = new ServerStyleSheet();
	const originalRenderPage = ctx.renderPage;

	try {
		ctx.renderPage = () =>
			originalRenderPage({
				// @ts-ignore
				enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />)
			});

		// @ts-ignore
		const initialProps = await Document.getInitialProps(ctx);
		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{sheet.getStyleElement()}
				</>
			)
		};
	} finally {
		sheet.seal();
	}
};
