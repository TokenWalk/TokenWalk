import {FunctionComponent, useState} from "react"
import config from "../../../config"
import networks from "../../../constants/networks"
import {VOTING_STRATEGIES} from "../../../constants/votingStrategies"
import {Usul, UsulDeployType, VotingStrategy, VotingStrategyName} from "../../../types/DAO"
import RadioButton from "../../Controls/RadioButton"
import Select from "../../Controls/Select"
import {toastError} from "../../UI/Toast"
import Modal from "../Modal"
import "./styles.scss"

const DeployUsulTypeModal: FunctionComponent<{
	isOpened: boolean
	onClose: () => void
	onSubmit: (
		type: UsulDeployType,
		module:
			| {usulAddress: string; strategyAddress: string; strategyType: VotingStrategyName}
			| "admin"
	) => void
	usuls: Usul[]
}> = ({isOpened, onClose, onSubmit, usuls}) => {
	const [type, setType] = useState<UsulDeployType>("usulSingle")
	const [selectedModuleIndex, setSelectedModuleIndex] = useState(-1)
	const [selectedStrategy, setSelectedStrategy] = useState<VotingStrategy | null>(null)

	const handleModuleSelect = (value: number) => {
		setSelectedModuleIndex(value)
		setSelectedStrategy(null)
	}

	const handleStrategySelect = (value: string) => {
		if (value === null) {
			setSelectedStrategy(null)
		}
		const strategy = usuls[selectedModuleIndex].strategies.find(s => s.address === value)
		if (!strategy) {
			throw new Error("Unexpected strategy")
		}
		setSelectedStrategy(strategy)
	}

	const handleSubmit = () => {
		if (selectedModuleIndex !== -1 && usuls[selectedModuleIndex].deployType === "usulMulti") {
			toastError("TODO: not supported for side net usul yet")
			return
		}
		if (selectedModuleIndex !== -1 && !selectedStrategy) return
		onSubmit(
			type,
			selectedModuleIndex === -1
				? "admin"
				: {
						usulAddress: usuls[selectedModuleIndex].usulAddress,
						strategyAddress: selectedStrategy!.address,
						strategyType: selectedStrategy!.name
				  }
		)
	}

	const submitButtonDisabled = selectedModuleIndex !== -1 && !selectedStrategy

	return (
		<Modal
			show={isOpened}
			onClose={onClose}
			title="Select Usul Deployment Type"
			onSubmit={handleSubmit}
			submitButtonDisabled={submitButtonDisabled}
		>
			<div className="deploy-usul-type-modal">
				<p>TODO: some description here</p>
				<div className="deploy-usul-type-modal__input">
					<label htmlFor="expand-dao-module">Module</label>
					<Select
						id="expand-dao-module"
						fullWidth
						onChange={handleModuleSelect}
						placeholder="Choose One"
						options={[
							{
								name: "Safe Admins",
								value: -1
							}
						].concat(
							usuls.map((usul, index) => ({
								name: `${usul.usulAddress} (${
									usul.deployType === "usulMulti"
										? networks[config.SIDE_CHAIN_ID]
										: networks[config.CHAIN_ID]
								})`,
								value: index
							}))
						)}
						value={selectedModuleIndex}
					/>
				</div>
				{selectedModuleIndex !== -1 && (
					<div className="deploy-usul-type-modal__input">
						<label htmlFor="members-strategy">Voting Strategy</label>
						<Select
							id="members-strategy"
							fullWidth
							onChange={handleStrategySelect}
							placeholder="Choose One"
							options={usuls[selectedModuleIndex].strategies.map(strategy => ({
								name:
									VOTING_STRATEGIES.find(s => s.strategy === strategy.name)?.title ?? strategy.name,
								value: strategy.address
							}))}
							value={selectedStrategy?.address ?? null}
						/>
					</div>
				)}
				<div className="deploy-usul-type-modal__input">
					<RadioButton
						label="Single Chain"
						id="deploy-usul-single"
						checked={type === "usulSingle"}
						onChange={() => {
							setType("usulSingle")
						}}
					/>
				</div>
				<div className="deploy-usul-type-modal__input">
					<RadioButton
						label="Multi Chain"
						id="deploy-usul-multi"
						checked={type === "usulMulti"}
						onChange={() => {
							setType("usulMulti")
						}}
					/>
				</div>
			</div>
		</Modal>
	)
}

export default DeployUsulTypeModal
