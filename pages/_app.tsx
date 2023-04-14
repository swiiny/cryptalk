import Navbar from '@components/navbar/Navbar';
import ResponsiveProvider from '@contexts/ResponsiveContext';
import Web3Provider from '@contexts/Web3Context';
import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from 'theme/GlobalStyles';
import { darkTheme } from 'theme/theme';

export const globalQueryConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			staleTime: Infinity
		}
	}
};

const CreateNextjsDapp = ({ Component, pageProps }: AppProps) => {
	const [queryClient] = useState(() => new QueryClient(globalQueryConfig));
	return (
		<>
			<Head>
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />

				<link rel='apple-touch-icon' href='/icon.png'></link>

				<meta name='application-name' content='Create Nextjs Dapp' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta name='apple-mobile-web-app-status-bar-style' content='default' />
				<meta name='apple-mobile-web-app-title' content='Create Nextjs Dapp' />
				<meta
					name='description'
					content='Starter to create Dapps with Next, React and Ethers. No longer waste valuable time building your project structure. Start coding is easy as npx create-nextjs-dapp'
				/>

				<meta name='theme-color' content='#1E1F20' />
			</Head>

			<QueryClientProvider client={queryClient}>
				<ResponsiveProvider>
					<Web3Provider>
						<ThemeProvider theme={darkTheme}>
							<GlobalStyle />
							<Navbar />
							<Component {...pageProps} />
						</ThemeProvider>
					</Web3Provider>
				</ResponsiveProvider>
			</QueryClientProvider>
		</>
	);
};

export default CreateNextjsDapp;
