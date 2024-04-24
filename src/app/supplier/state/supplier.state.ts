import {AppState} from "../../state/app.store";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";
import {Supplier} from "../../generated/models/supplier";

export interface SupplierState extends AppState {
    suppliers: Supplier[];
    supplier: Supplier | null;
    suppliersNeedRefresh: boolean;
}

export const initialState: SupplierState = {
    suppliers: [],
    supplier: null,
    suppliersNeedRefresh: true
}

const getSupplierFeatureState = createFeatureSelector<SupplierState>(Features.SUPPLIER);

export const getSuppliers = createSelector(
    getSupplierFeatureState,
    state => state.suppliers
)

export const getSuppliersNeedRefresh = createSelector(
    getSupplierFeatureState,
    state => state.suppliersNeedRefresh
)
