import {createReducer, on} from "@ngrx/store";
import {initialState, SupplierState} from "./supplier.state";
import {loadSuppliersSuccess} from "./supplier.actions";

export const supplierReducer = createReducer<SupplierState>(
    initialState,
    on(loadSuppliersSuccess, (state, action): SupplierState => {
        return {
            ...state,
            suppliers: action.suppliers
        }
    })
)
