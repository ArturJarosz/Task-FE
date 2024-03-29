import {AppState} from "../../state/app.store";
import {Client} from "../client";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";

export interface ClientState extends AppState {
    error: string;
    clients: Client[];
    client: Client | null
}

export const initialState: ClientState = {
    error: '',
    clients: [],
    client: null
}

// selectors

const getClientFeatureState = createFeatureSelector<ClientState>(Features.CLIENT);

export const getClients = createSelector(
    getClientFeatureState,
    state => state.clients
)

export const getClient = createSelector(
    getClientFeatureState,
    state => state.client
)
