import {ChangeEvent, FunctionComponent, useContext, useState} from "react"
import Input from "../../Controls/Input"
import Button from "../../Controls/Button"
import Select from "../../Controls/Select"
import {AuthContext} from "../../../context/AuthContext"
import EthersContext from "../../../context/EthersContext"
import addSafeProposal from "../../../api/firebase/safeProposal/addSafeProposal"
import {toastError, toastSuccess} from "../../Toast"
import {SafeSignature} from "../../../api/ethers/functions/gnosisSafe/safeUtils"
import {
	executeAddOwner,
	executeRemoveOwner,
	signAddOwner,
	signRemoveOwner
} from "../../../api/ethers/functions/gnosisSafe/addRemoveOwner"
import useDAO from "../../../hooks/getters/useDAO"
import ErrorPlaceholder from "../../ErrorPlaceholder"
import Loader from "../../Loader"

const ChangeRole: FunctionComponent<{
	gnosisAddress: string
	gnosisVotingThreshold: number
	ownersCount: number
	title: string
	description: string
	afterSubmit: () => void
}> = ({gnosisAddress, gnosisVotingThreshold, ownersCount, title, description, afterSubmit}) => {
	const {dao, loading, error} = useDAO(gnosisAddress)
	const {account} = useContext(AuthContext)
	const {provider, signer} = useContext(EthersContext)
	const [processing, setProcessing] = useState(false)
	const [address, setAddress] = useState("")
	const [newRole, setNewRole] = useState<"admin" | "kick">("admin")
	const [newThreshold, setNewThreshold] = useState("")

	if (error) return <ErrorPlaceholder />
	if (!dao || loading) return <Loader />

	const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.value && Number(e.target.value) < 1) {
			setNewThreshold("1")
		} else if (Number(e.target.value) > (newRole === "kick" ? ownersCount - 1 : ownersCount + 1)) {
			setNewThreshold(String(newRole === "kick" ? ownersCount - 1 : ownersCount + 1))
		} else {
			setNewThreshold(e.target.value)
		}
	}

	const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		if (e.target.value === "kick") {
			setAddress("")
			if (Number(newThreshold) > ownersCount - 1) {
				setNewThreshold(String(ownersCount - 1))
			}
		}
		setNewRole(e.target.value as "admin")
	}

	const handleSubmit = async () => {
		if (
			!(provider && signer && account && address && newRole) ||
			!newThreshold ||
			isNaN(Number(newThreshold))
		) {
			return
		}
		setProcessing(true)
		let signature: SafeSignature
		try {
			if (newRole === "admin") {
				// processing add owner
				signature = await signAddOwner(gnosisAddress, address, Number(newThreshold), signer)
				if (gnosisVotingThreshold === 1) {
					await executeAddOwner(gnosisAddress, address, Number(newThreshold), [signature], signer)
				}
			} else {
				// processing kick
				const owner = dao.owners.find(addr => addr === address.toLowerCase())
				if (!owner) {
					throw new Error("Member not exists")
				}
				signature = await signRemoveOwner(gnosisAddress, address, Number(newThreshold), signer)
				if (gnosisVotingThreshold === 1) {
					await executeRemoveOwner(
						gnosisAddress,
						address,
						Number(newThreshold),
						[signature],
						signer
					)
				}
			}
			await addSafeProposal({
				type: "changeRole",
				gnosisAddress,
				title,
				...(description ? {description} : {}),
				recipientAddress: address,
				newThreshold: Number(newThreshold),
				newRole,
				signatures: [signature],
				state: gnosisVotingThreshold === 1 ? "executed" : "active"
			})
			toastSuccess("Proposal successfully created")
			setAddress("")
			setNewRole("admin")
			afterSubmit()
		} catch (e) {
			console.error(e)
			toastError("Failed to create proposal")
		}
		setProcessing(false)
	}

	const submitButtonDisabled =
		!(title && address && newRole) || !newThreshold || isNaN(Number(newThreshold))

	return (
		<>
			<div className="create-dao-proposal__row">
				<div className="create-dao-proposal__col">
					<label htmlFor="change-role-address">Member&apos;s Address</label>
					{newRole === "kick" ? (
						<Select
							options={[{name: "Choose one", value: ""}].concat(
								dao.owners.map(addr => ({name: addr, value: addr}))
							)}
							value={address}
							onChange={e => {
								setAddress(e.target.value)
							}}
						/>
					) : (
						<Input
							borders="all"
							id="change-role-address"
							value={address}
							onChange={e => {
								setAddress(e.target.value)
							}}
						/>
					)}
				</div>
				<div className="create-dao-proposal__col">
					<label htmlFor="change-role-role">Proposed New Role</label>
					<Select
						options={[
							{name: "Admin", value: "admin"},
							{name: "Kick", value: "kick"}
						]}
						onChange={handleRoleChange}
						value={newRole}
					/>
				</div>
			</div>
			<label htmlFor="change-role-threshold">New Threshold</label>
			<Input
				id="change-role-threshold"
				borders="all"
				number
				value={newThreshold}
				onChange={handleThresholdChange}
			/>
			<Button onClick={handleSubmit} disabled={processing || submitButtonDisabled}>
				{processing ? "Processing..." : "Create Proposal"}
			</Button>
		</>
	)
}

export default ChangeRole
