import {AppState} from "../../state/app.store";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";
import {Supplier} from "../../generated/models/supplier";

export interface SupplierState extends AppState {
    suppliers: Supplier[];
}

export const initialState: SupplierState = {
    suppliers: []
}

const getSupplierFeatureState = createFeatureSelector<SupplierState>(Features.SUPPLIER);

export const getSuppliers = createSelector(
    getSupplierFeatureState,
    state => state.suppliers
)
