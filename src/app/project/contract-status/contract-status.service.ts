import {Injectable} from "@angular/core";
import {ContractStatus, ProjectContract} from "../project";
import {Store} from "@ngrx/store";
import {
    acceptOffer,
    completeContract,
    makeNewOffer,
    ProjectState,
    rejectOffer,
    resumeContract,
    signContract,
    terminateContract
} from "../state";

enum ContractStatusTransitions {
    REJECT_OFFER = "REJECT_OFFER",
    ACCEPT_OFFER = "ACCEPT_OFFER",
    MAKE_NEW_OFFER = "MAKE_NEW_OFFER",
    SING_CONTRACT = "SING_CONTRACT",
    REJECT_ACCEPTED = "REJECT_ACCEPTED",
    TERMINATE_CONTRACT = "TERMINATE_CONTRACT",
    COMPLETE_CONTRACT = "COMPLETE_CONTRACT",
    REOPEN_CONTRACT = "REOPEN_CONTRACT"
}

let CONTRACT_FLOW: any = {
    OFFER: {
        REJECTED: ContractStatusTransitions.REJECT_OFFER,
        ACCEPTED: ContractStatusTransitions.ACCEPT_OFFER
    },
    REJECTED: {
        OFFER: ContractStatusTransitions.MAKE_NEW_OFFER
    },
    ACCEPTED: {
        SIGNED: ContractStatusTransitions.SING_CONTRACT,
        REJECTED: ContractStatusTransitions.REJECT_ACCEPTED
    },
    SIGNED: {
        TERMINATED: ContractStatusTransitions.TERMINATE_CONTRACT,
        COMPLETED: ContractStatusTransitions.COMPLETE_CONTRACT
    },
    TERMINATED: {
        SIGNED: ContractStatusTransitions.REOPEN_CONTRACT
    },
    COMPLETED: {}
}

export abstract class ContractStatusService {
    abstract resolveContractStatusChange(contract: ProjectContract, oldStatus: ContractStatus): void;
}

// TODO: TA-379 To be removed when contact status API is simplified
@Injectable()
export class ContractStatusServiceImpl implements ContractStatusService {

    constructor(private projectState: Store<ProjectState>) {
    }

    resolveContractStatusChange(contract: ProjectContract, oldStatus: ContractStatus): void {
        let transition = CONTRACT_FLOW[oldStatus.toString()][contract.status.toString()] as ContractStatusTransitions;
        console.log(`contract data: ${JSON.stringify(contract)}`);
        switch (transition) {
            case ContractStatusTransitions.ACCEPT_OFFER:
                this.projectState.dispatch(acceptOffer({contractId: contract.id!, contract: contract}));
                break;
            case ContractStatusTransitions.REJECT_OFFER:
            case ContractStatusTransitions.REJECT_ACCEPTED:
                this.projectState.dispatch(rejectOffer({contractId: contract.id!, contract: contract}));
                break;
            case ContractStatusTransitions.MAKE_NEW_OFFER:
                this.projectState.dispatch(makeNewOffer({contractId: contract.id!, contract: contract}));
                break;
            case ContractStatusTransitions.SING_CONTRACT:
                this.projectState.dispatch(signContract({contractId: contract.id!, contract: contract}));
                break;
            case ContractStatusTransitions.TERMINATE_CONTRACT:
                this.projectState.dispatch(terminateContract({contractId: contract.id!, contract: contract}));
                break;
            case ContractStatusTransitions.COMPLETE_CONTRACT:
                this.projectState.dispatch(completeContract({contractId: contract.id!, contract: contract}));
                break;
            case ContractStatusTransitions.REOPEN_CONTRACT:
                this.projectState.dispatch(resumeContract({contractId: contract.id!, contract: contract}));
                break;
        }
    }

}


