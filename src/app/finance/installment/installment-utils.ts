import {Installment, InstallmentType} from "../../generated/models";
import {parseISO} from "date-fns";

// The deposit is added when the contract is signed. It belongs to the whole project, not to a stage
export function isDeposit(installment: Installment | null | undefined): boolean {
    return installment?.type === InstallmentType.DEPOSIT;
}

// What an installment pays for: "Deposit", or the name of its stage
export function installmentName(installment: Installment | null | undefined): string {
    return isDeposit(installment) ? 'Deposit' : installment?.stageName ?? 'Installment';
}

// Not paid and due before the given day; one without a due date is never overdue
export function isInstallmentOverdue(installment: Installment, today: Date): boolean {
    return !installment.paid && !!installment.dueDate && parseISO(installment.dueDate) < today;
}
