export enum CostCategory {
    FUEL = "FUEL",
    MISTAKE = "MISTAKE"
}

export interface Cost {
    id?: number,
    name: string,
    date: Date,
    category: CostCategory,
    value: number,
    note: string | null,
    hasInvoice: boolean,
    payable?: boolean,
    paid: boolean
}

