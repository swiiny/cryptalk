import dialogflow from '@google-cloud/dialogflow';

const projectId = process.env.DIALOGFLOW_PROJECT_ID || '';
//const sessionId = 'unique-session-id'; // You can generate a unique ID for each user session
const languageCode = 'en-US';

// import credentials from '../../private/appogee-dev-api-10fa1401f35c.json';
import credentials from '../../private/cryptalk-383723-3589ec633636.json';

//const sessionClient = new dialogflow.SessionsClient();

async function sendMessageToDialogflow(text: string, sessionId: string) {
	if (!projectId) {
		throw new Error('Project ID is required');
	}

	//const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
	const sessionClient = new dialogflow.SessionsClient({ credentials });
	const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

	const request = {
		session: sessionPath,
		queryInput: {
			text: {
				text,
				languageCode
			}
		}
	};

	const responses = await sessionClient.detectIntent(request);
	const result = responses[0].queryResult;

	// Extract the intent and the Token A value
	//const intent = result.intent.displayName;
	//const tokenA = result.parameters.fields['TokenA'].stringValue;

	return result;
}

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { message, sessionId } = req.body;
		try {
			const response = await sendMessageToDialogflow(message, sessionId);
			res.status(200).json(response);
		} catch (error) {
			console.error('Dialogflow error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	} else {
		res.status(405).json({ error: 'Method not allowed' });
	}
}
