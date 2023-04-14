import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export default async function handler(
	req: { method: string; body: { prompt: string } },
	res: {
		status: (arg0: number) => {
			(): any;
			new (): any;
			json: { (arg0: { error?: string; response?: string }): void; new (): any };
		};
	}
) {
	if (req.method === 'POST') {
		const { prompt } = req.body;

		try {
			if (!prompt) {
				res.status(400).json({ error: 'Message is required' });
				return;
			}

			// Generate a response from GPT-3.5
			const response = await openai.createCompletion({
				model: 'text-davinci-003',
				prompt: `${prompt}`,
				max_tokens: 100,
				//n: 1,
				//stop: null,
				temperature: 0.5
			});

			if (!response.data.choices[0].text) {
				throw new Error('No response from GPT-3.5');
			}

			const generatedText = response.data.choices[0].text.trim();

			res.status(200).json({ response: generatedText });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'An error occurred while processing the request' });
		}
	} else {
		res.status(405).json({ error: 'Method not allowed' });
	}
}
