import Meta from '@components/shared/Meta';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

const Error500: FC = () => {
	const router = useRouter();

	useEffect(() => {
		// Redirect to home page
		router.push('/');
	}, [router]);

	return (
		<>
			<Meta title='500' />
		</>
	);
};

export default Error500;
