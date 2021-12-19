import {FunctionComponent, useContext, useState} from "react"
import {AuthContext} from "../../../context/AuthContext"
import {VotingStrategy} from "../../../types/DAO"
import Select from "../../Controls/Select"
import CreateAdminProposal from "./CreateAdminProposal"
import CreateStrategyProposal from "./CreateStrategyProposal"
import "./styles.scss"

const CreateDaoProposal: FunctionComponent<{
	gnosisAddress: string
	usulAddress?: string
	gnosisVotingThreshold: number
	ownersCount: number
	strategies: VotingStrategy[]
	isAdmin: boolean
}> = ({gnosisAddress, usulAddress, gnosisVotingThreshold, ownersCount, strategies, isAdmin}) => {
	const {connected} = useContext(AuthContext)
	const [module, setModule] = useState(isAdmin ? -1 : 0)

	if (!connected) return <div>TODO: Please connect wallet</div>

	return (
		<div className="create-dao-proposal">
			<h2>Create a New Proposal</h2>
			<label>Proposal module</label>
			<Select
				options={[
					...(isAdmin
						? [
								{
									name: "Admin",
									value: -1
								}
						  ]
						: []),
					...strategies.map((strategy, index) => ({
						name: strategy.name,
						value: index
					}))
				]}
				value={module}
				placeholder="Select Module"
				onChange={setModule}
			/>
			{module === -1 && (
				<CreateAdminProposal
					gnosisAddress={gnosisAddress}
					gnosisVotingThreshold={gnosisVotingThreshold}
					ownersCount={ownersCount}
				/>
			)}{" "}
			{module > -1 && usulAddress && (
				<CreateStrategyProposal
					gnosisAddress={gnosisAddress}
					usulAddress={usulAddress}
					strategyAddress={strategies[module].address}
					strategyType={strategies[module].name}
				/>
			)}
		</div>
	)
}

export default CreateDaoProposal
