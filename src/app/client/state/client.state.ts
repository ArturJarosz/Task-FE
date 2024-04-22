import {AppState} from "../../state/app.store";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";
import {Client} from "../../generated/models/client";

export interface ClientState extends AppState {
    error: string;
    clients: Client[];
    client: Client | null,
    clientsNeedRefresh: boolean,
}

export const initialState: ClientState = {
    error: '',
    clients: [],
    client: null,
    clientsNeedRefresh: false
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

export const getClientsNeedRefresh = createSelector(
    getClientFeatureState,
    state => state.clientsNeedRefresh
)
