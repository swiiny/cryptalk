interface IMessage {
	id: string;
	user: string; // user address or "gpt-3.5"
	value: string;
	timestamp: number;
}

export type { IMessage };
