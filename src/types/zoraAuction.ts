export type ZoraAuctionFirebaseData = {
	id: number
	gnosisAddress: string
	nftName: string
	nftAddress: string
	nftId: number
	duration: number
	reservePrice: number
	curatorAddress: string
	curatorFeePercentage: number
	tokenSymbol: string
	tokenAddress: string
	creationDate: string
	approved: boolean
}

export type ZoraAuctionEthersData = {
	price: number
	state: "waitingApproval" | "approved" | "live" | "ended"
	endTime?: number
}

export type ZoraAuction = ZoraAuctionEthersData & ZoraAuctionFirebaseData
