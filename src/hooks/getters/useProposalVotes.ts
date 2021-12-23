import {useContext, useEffect, useState} from "react"
import {getProposalVotesList} from "../../api/ethers/functions/Usul/voting/votingApi"
import {toastError} from "../../components/UI/Toast"
import ProviderContext from "../../context/ProviderContext"
import {StrategyProposal, StrategyProposalVote} from "../../types/strategyProposal"

const useProposalVotes = (
	proposal: StrategyProposal | null
): {
	votes: StrategyProposalVote[]
	loading: boolean
} => {
	const [votes, setVotes] = useState<StrategyProposalVote[]>([])
	const [loading, setLoading] = useState(false)
	const {provider} = useContext(ProviderContext)

	const getData = async (_proposal: StrategyProposal) => {
		setLoading(true)
		try {
			const res = await getProposalVotesList(_proposal.usulAddress, _proposal.id, provider)
			setVotes(res)
		} catch (e) {
			console.error(e)
			toastError("Failed to get votes list")
		}
		setLoading(false)
	}

	useEffect(() => {
		if (proposal) {
			getData(proposal)
		}
	}, [proposal])

	return {
		votes,
		loading
	}
}

export default useProposalVotes
