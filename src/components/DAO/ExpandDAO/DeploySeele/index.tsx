import {FunctionComponent, useContext, useEffect, useState} from "react"
import ExpandDaoLayout from "../ExpandDaoLayout"
import {BuiltVotingStrategy} from "../../../../types/DAO"
import ChooseVotingStrategies from "../ChooseVotingStrategies"
import {
	buildSeeleDeployTxSequence,
	SafeTransaction
} from "../../../../api/ethers/functions/gnosisSafe/safeUtils"
import EthersContext from "../../../../context/EthersContext"
import ReviewDeploySeele from "../ReviewDeploySeele"
import useProposals from "../../../../hooks/getters/useProposals"
import ErrorPlaceholder from "../../../UI/ErrorPlaceholder"

type ExpandDaoStage = "chooseStrategies" | "review" | "waiting" | "done"

const STAGE_HEADERS: {[key in ExpandDaoStage]: {title: string; description?: string}} = {
	chooseStrategies: {
		title: "Seele",
		description: `This module allows avatars to operate with trustless tokenized DeGov, similar to Compound
        or Gitcoin, with a proposal core that can register swappable voting contracts. This
        enables DAOs to choose from various on-chain voting methods that best suit their needs.
		
		Determine which voting strateg(ies) best fit your DAO’s decision-making process, set up
		the required parameters to each, and add the strateg(ies) to the deployment queue. You
		can add as many as you would like. Once you have finished, proceed to the next step to
		confirm your transactions and deploy.`
	},
	review: {
		title: "Confirm Bundle Transactions"
	},
	waiting: {
		title: "Waiting for approval"
	},
	done: {
		title: "Seele deployed"
	}
}

const DeploySeele: FunctionComponent<{
	gnosisAddress: string
	gnosisVotingThreshold: number
}> = ({gnosisAddress, gnosisVotingThreshold}) => {
	const {signer} = useContext(EthersContext)
	const [stage, setStage] = useState<ExpandDaoStage>("chooseStrategies")
	const [strategies, setStrategies] = useState<BuiltVotingStrategy[]>([])
	const [transactions, setTransactions] = useState<{tx: SafeTransaction; name: string}[]>([])
	const [expectedSeeleAddress, setExpectedSeeleAddress] = useState("")
	useEffect(() => {
		if (signer) {
			buildSeeleDeployTxSequence(strategies, gnosisAddress, signer).then(res => {
				setTransactions(res.transactions)
				setExpectedSeeleAddress(res.expectedSeeleAddress)
			})
		}
	}, [strategies, gnosisAddress, signer])

	const {proposals, error} = useProposals(gnosisAddress)
	useEffect(() => {
		if (proposals) {
			const expandProposal = proposals.find(
				proposal => proposal.type === "decentralizeDAO" && proposal.state === "active"
			)
			if (expandProposal) {
				setStage("waiting")
			}
		}
	}, [proposals])

	if (error) return <ErrorPlaceholder />

	return (
		<ExpandDaoLayout
			title={STAGE_HEADERS[stage].title}
			description={STAGE_HEADERS[stage].description}
		>
			{stage === "chooseStrategies" && (
				<ChooseVotingStrategies
					gnosisAddress={gnosisAddress}
					strategies={strategies}
					transactions={transactions}
					onStrategyAdd={strat => {
						setStrategies(prevState => [...prevState, strat])
					}}
					onStrategyRemove={index => {
						setStrategies(prevState => prevState.filter((_, idx) => idx !== index))
					}}
					onSubmit={() => {
						setStage("review")
					}}
				/>
			)}
			{stage === "review" && (
				<ReviewDeploySeele
					transactions={transactions}
					gnosisAddress={gnosisAddress}
					gnosisVotingThreshold={gnosisVotingThreshold}
					expectedSeeleAddress={expectedSeeleAddress}
					afterSubmit={() => {
						setStage(gnosisVotingThreshold === 1 ? "done" : "waiting")
					}}
				/>
			)}
			{stage === "waiting" && <div>TODO: waiting for approval</div>}
			{stage === "done" && <div>TODO: success</div>}
		</ExpandDaoLayout>
	)
}

export default DeploySeele
