interface EIP712DomainType {
	name: string;
	version: string;
	chainId: number;
	verifyingContract: string;
}

export type { EIP712DomainType };
