import {createAction, props} from "@ngrx/store";
import {Supplier} from "../model/supplier";

const SUPPLIER = '[SUPPLIERS]';

const LOAD_SUPPLIERS = `${SUPPLIER} Load suppliers`;
const LOAD_SUPPLIERS_SUCCESS = `${SUPPLIER} Load suppliers success`;
const LOAD_SUPPLIERS_ERROR = `${SUPPLIER} Load suppliers error`;

export const loadSuppliers = createAction(LOAD_SUPPLIERS);
export const loadSuppliersSuccess = createAction(LOAD_SUPPLIERS_SUCCESS, props<{ suppliers: Supplier[] }>());
export const loadSuppliersError = createAction(LOAD_SUPPLIERS_ERROR, props<{ error: string }>());
