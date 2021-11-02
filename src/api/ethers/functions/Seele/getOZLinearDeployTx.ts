import {JsonRpcSigner} from "@ethersproject/providers"
import OZLinearVoting from "../../abis/OZLinearVoting.json"
import ModuleFactory from "../../abis/ModuleFactory.json"
import {Contract} from "@ethersproject/contracts"
import {defaultAbiCoder} from "@ethersproject/abi"
import {keccak256} from "@ethersproject/solidity"
import {getCreate2Address} from "@ethersproject/address"
import {buildContractCall, SafeTransaction} from "../gnosisSafe/safeUtils"
const {REACT_APP_MODULE_FACTORY_ADDRESS, REACT_APP_OZ_LINEAR_MASTER_ADDRESS} = process.env

const getOZLinearDeployTx = async (
	safeAddress: string,
	governanceToken: string,
	seeleModule: string,
	quorumThreshold: number,
	delay: number,
	votingPeriod: number,
	name: string,
	signer: JsonRpcSigner
): Promise<[SafeTransaction, string]> => {
	const linearVotingMaster = new Contract(
		REACT_APP_OZ_LINEAR_MASTER_ADDRESS!,
		OZLinearVoting.bytecode,
		signer
	)
	const factory = new Contract(REACT_APP_MODULE_FACTORY_ADDRESS!, ModuleFactory.abi, signer)
	const encodedLinearInitParams = defaultAbiCoder.encode(
		["address", "address", "address", "uint256", "uint256", "uint256", "string"],
		[
			safeAddress, // owner
			governanceToken,
			"0x0000000000000000000000000000000000000001",
			votingPeriod,
			quorumThreshold, // number of votes wieghted to pass
			delay, // number of days proposals are active
			name
		]
	)
	const initLinearData = linearVotingMaster.interface.encodeFunctionData("setUp", [
		encodedLinearInitParams
	])
	const masterLinearCopyAddress = linearVotingMaster.address.toLowerCase().replace(/^0x/, "")
	const byteCodeLinear =
		"0x602d8060093d393df3363d3d373d3d3d363d73" +
		masterLinearCopyAddress +
		"5af43d82803e903d91602b57fd5bf3"
	const saltLinear = keccak256(
		["bytes32", "uint256"],
		[keccak256(["bytes"], [initLinearData]), "0x01"]
	)
	const expectedLinearAddress = getCreate2Address(
		factory.address,
		saltLinear,
		keccak256(["bytes"], [byteCodeLinear])
	)
	const deployLinear = buildContractCall(
		factory,
		"deployModule",
		[linearVotingMaster.address, initLinearData, "0x01"],
		0
	)
	return [deployLinear, expectedLinearAddress]
}

export default getOZLinearDeployTx