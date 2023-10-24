import {createAction, props} from "@ngrx/store";
import {Client} from "../client";

const CLIENTS = "[CLIENTS]"

const LOAD_CLIENTS = `${CLIENTS} Load clients`;
const LOAD_CLIENTS_SUCCESS = `${CLIENTS} Load clients success`;
const LOAD_CLIENTS_ERROR = `${CLIENTS} Load clients error`;

const LOAD_CLIENT = `${CLIENTS} Load client`;
const LOAD_CLIENT_SUCCESS = `${CLIENTS} Load client success`;
const LOAD_CLIENT_ERROR = `${CLIENTS} Load client error`;

const CREATE_CLIENT = `${CLIENTS} Create client`;
const CREATE_CLIENT_SUCCESS = `${CLIENTS} Create client success`;
const CREATE_CLIENT_ERROR = `${CLIENTS} Create client error`;

const REMOVE_CLIENT = `${CLIENTS} Remove client`;
const REMOVE_CLIENT_SUCCESS = `${CLIENTS} Remove client success`;
const REMOVE_CLIENT_ERROR = `${CLIENTS} Remove client error`;

export const loadClients = createAction(LOAD_CLIENTS);
export const loadClientsSuccess = createAction(LOAD_CLIENTS_SUCCESS, props<{ clients: Client[] }>());
export const loadClientsError = createAction(LOAD_CLIENTS_ERROR, props<{ error: string }>());

export const loadClient = createAction(LOAD_CLIENT, props<{ clientId: number }>());
export const loadClientSuccess = createAction(LOAD_CLIENT_SUCCESS, props<{ client: Client }>());
export const loadClientError = createAction(LOAD_CLIENT_ERROR, props<{ error: string }>());

export const createClient = createAction(CREATE_CLIENT, props<{ client: Client }>());
export const createClientSuccess = createAction(CREATE_CLIENT_SUCCESS, props<{ client: Client }>());
export const createClientError = createAction(CREATE_CLIENT_ERROR, props<{ error: string }>());

export const removeClient = createAction(REMOVE_CLIENT, props<{clientId: number}>());
export const removeClientSuccess = createAction(REMOVE_CLIENT_SUCCESS);
export const removeClientError = createAction(REMOVE_CLIENT_ERROR, props<{error: string}>());
