import {AppState} from "../../state/app.store";
import {Supplier} from "../model/supplier";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";

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
