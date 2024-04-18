import {createAction, props} from "@ngrx/store";
import {Supplier} from "../../generated/models/supplier";

const SUPPLIERS = '[SUPPLIERS]';

const LOAD_SUPPLIERS = `${SUPPLIERS} Load suppliers`;
const LOAD_SUPPLIERS_SUCCESS = `${SUPPLIERS} Load suppliers success`;
const LOAD_SUPPLIERS_ERROR = `${SUPPLIERS} Load suppliers error`;

const CREATE_SUPPLIER = `${SUPPLIERS} Create supplier`;
const CREATE_SUPPLIER_SUCCESS = `${SUPPLIERS} Create supplier success`;
const CREATE_SUPPLIER_ERROR = `${SUPPLIERS} Create supplier error`;

export const loadSuppliers = createAction(LOAD_SUPPLIERS);
export const loadSuppliersSuccess = createAction(LOAD_SUPPLIERS_SUCCESS, props<{ suppliers: Supplier[] }>());
export const loadSuppliersError = createAction(LOAD_SUPPLIERS_ERROR, props<{ error: string }>());

export const createSupplier = createAction(CREATE_SUPPLIER, props<{ supplier: Supplier }>());
export const createSupplierSuccess = createAction(CREATE_SUPPLIER_SUCCESS, props<{ supplier: Supplier }>());
export const createSupplierError = createAction(CREATE_SUPPLIER_ERROR, props<{ error: string }>());
