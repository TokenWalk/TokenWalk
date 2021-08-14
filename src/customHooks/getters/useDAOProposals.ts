import {useContext, useEffect, useState} from "react"
import {Proposal} from "../../types/proposal"
import getDAOProposals from "../../api/firebase/proposal/getDAOProposals"
import {getHouseERC20DAOProposal} from "../../api/ethers/functions/ERC20DAO/getERC20DAO"
import {Web3Provider} from "@ethersproject/providers"
import EthersContext from "../../context/EthersContext"
import getERC20Balance from "../../api/ethers/functions/ERC20Token/getERC20Balance"
import getDAO from "../../api/firebase/DAO/getDAO"

const useDAOProposals = (
	gnosisAddress: string
): {
	proposals: (Proposal & {proposalId: string})[]
	loading: boolean
	error: boolean
} => {
	const {provider} = useContext(EthersContext)
	const [proposals, setProposals] = useState<(Proposal & {proposalId: string})[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	const getProposals = async (_gnosisAddress: string, _provider: Web3Provider) => {
		setLoading(true)
		setError(false)
		try {
			const dao = await getDAO(_gnosisAddress)
			const firebaseData = (await getDAOProposals(_gnosisAddress)).docs.map(doc => ({
				...doc.data(),
				proposalId: doc.id
			}))
			const ethersData = await Promise.all(
				firebaseData.map(async p => {
					if (p.type === "joinHouse") {
						const balance = await getERC20Balance(dao.tokenAddress!, p.userAddress, _provider)
						const proposalData = await getHouseERC20DAOProposal(
							dao.daoAddress!,
							Number(p.id),
							_provider
						)
						return {
							...proposalData,
							balance
						}
					}
					if (p.module === "DAO") {
						return getHouseERC20DAOProposal(dao.daoAddress!, Number(p.id), _provider)
					} else {
						return {}
					}
				})
			)
			setProposals(
				firebaseData.map(
					(p, index) =>
						({
							...p,
							...ethersData[index],
							id: Number(p.id),
							state: p.state!
						} as Proposal & {proposalId: string})
				)
			)
		} catch (e) {
			console.error(e)
			setError(true)
		}
		setLoading(false)
	}

	useEffect(() => {
		if (gnosisAddress && provider) {
			getProposals(gnosisAddress, provider)
		}
	}, [gnosisAddress, provider])

	return {
		proposals,
		loading,
		error
	}
}

export default useDAOProposals