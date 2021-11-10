import {FunctionComponent, useState} from "react"
import {ReactComponent as GnosisSafeIcon} from "../../../assets/icons/gnosis-safe.svg"
import ExpandDaoLayout from "./ExpandDaoLayout"
import DeploySeele from "./DeploySeele"
import "./styles.scss"

const DESCRIPTION = `Modules are your way of customizing, upgrading, and expanding your DAO. 
        Here you can choose to swap voting strategies, add multiple strategies, or remove a strategy at any time. 
        You can also introduce the Zodiac modules Bridge (for a constellation of voting strategies across chains), 
        Exit (for a Moloch-style rage quit assigned to different asset holders), 
        or Photon (a way to enact governance at the speed of light — coming soon).`

const ExpandDAO: FunctionComponent<{
	gnosisAddress: string
	gnosisVotingThreshold: number
}> = ({gnosisAddress, gnosisVotingThreshold}) => {
	const [stage, setStage] = useState<"choose" | "seele" | "bridge">("choose")

	return (
		<section className="expand-dao">
			{stage === "choose" && (
				<ExpandDaoLayout title="Expand DAO" description={DESCRIPTION}>
					<div className="expand-dao__modules">
						<div className="expand-dao__modules-gnosis-safe">
							<GnosisSafeIcon width="225px" height="225px" />
						</div>
						<div className="expand-dao__modules-connectable">
							<div className="expand-dao__modules-seele" onClick={() => setStage("seele")} />
						</div>
					</div>
				</ExpandDaoLayout>
			)}
			{stage === "seele" && (
				<DeploySeele gnosisAddress={gnosisAddress} gnosisVotingThreshold={gnosisVotingThreshold} />
			)}
		</section>
	)
}

export default ExpandDAO