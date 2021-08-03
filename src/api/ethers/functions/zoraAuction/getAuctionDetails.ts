import {Web3Provider} from "@ethersproject/providers"
import {Contract} from "@ethersproject/contracts"
import Auction from "../../abis/ZoraAuction.json"
import {ZoraAuctionEthersData} from "../../../../types/zoraAuction"
import {formatEther} from "@ethersproject/units"
const {REACT_APP_ZORA_ADDRESS} = process.env

const getAuctionDetails = async (
	auctionId: number,
	provider: Web3Provider
): Promise<ZoraAuctionEthersData> => {
	const auction = new Contract(REACT_APP_ZORA_ADDRESS!, Auction.abi, provider)
	const {amount, approved, firstBidTime, duration, reservePrice} = await auction.auctions(auctionId)
	const endTime = (Number(firstBidTime.toString()) + Number(duration.toString())) * 1000
	// TODO: ended state
	const state = approved
		? Number(firstBidTime.toString()) > 0
			? endTime < new Date().getTime()
				? "ended"
				: "live"
			: "approved"
		: "waitingApproval"

	return {
		price: Math.max(
			Number(formatEther(amount.toString())),
			Number(formatEther(reservePrice.toString()))
		),
		state,
		...(state === "live" ? {endTime} : {})
	}
}

export default getAuctionDetails
