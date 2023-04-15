export interface IDialogFlowResponse {
	fulfillmentMessages?: FulfillmentMessagesEntity[] | null;
	outputContexts?: null[] | null;
	queryText: string;
	speechRecognitionConfidence: number;
	action: string;
	parameters: Parameters;
	allRequiredParamsPresent: boolean;
	fulfillmentText: string;
	webhookSource: string;
	webhookPayload?: null;
	intent: Intent;
	intentDetectionConfidence: number;
	diagnosticInfo?: null;
	languageCode: string;
	sentimentAnalysisResult?: null;
	cancelsSlotFilling: boolean;
}
export interface FulfillmentMessagesEntity {
	platform: string;
	text: Text;
	message: string;
}
export interface Text {
	text?: string[] | null;
}
export interface Parameters {
	fields: Fields;
}
export interface Fields {}
export interface Intent {
	inputContextNames?: null[] | null;
	events?: null[] | null;
	trainingPhrases?: null[] | null;
	outputContexts?: null[] | null;
	parameters?: null[] | null;
	messages?: null[] | null;
	defaultResponsePlatforms?: null[] | null;
	followupIntentInfo?: null[] | null;
	name: string;
	displayName: string;
	priority: number;
	isFallback: boolean;
	webhookState: string;
	action: string;
	resetContexts: boolean;
	rootFollowupIntentName: string;
	parentFollowupIntentName: string;
	mlDisabled: boolean;
	liveAgentHandoff: boolean;
	endInteraction: boolean;
}
