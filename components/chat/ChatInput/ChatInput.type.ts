interface IChatInput {}

type TSwapData = {
	tokenA?: string | null;
	tokenB?: string | null;
	amount?: number | null;
	slippage?: number | null;
	isReadyToSwap?: boolean;
};

export type { IChatInput, TSwapData };
