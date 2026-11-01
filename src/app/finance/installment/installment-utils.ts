import {Installment, InstallmentType} from "../../generated/models";

// The deposit is added when the contract is signed. It belongs to the whole project, not to a stage
export function isDeposit(installment: Installment | null | undefined): boolean {
    return installment?.type === InstallmentType.DEPOSIT;
}

// What an installment pays for: "Deposit", or the name of its stage
export function installmentName(installment: Installment | null | undefined): string {
    return isDeposit(installment) ? 'Deposit' : installment?.stageName ?? 'Installment';
}
