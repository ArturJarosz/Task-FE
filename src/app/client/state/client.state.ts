import {AppState} from "../../state/app.store";
import {Client} from "../client";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";

export const CLIENT_FEATURE_NAME = "client";

export interface ClientState extends AppState {
    error: string;
    clients: Client[];
    client: Client | null,
    currentClientId: number | null;
}

export const initialState: ClientState = {
    error: '',
    clients: [],
    client: null,
    currentClientId: null
}

// selectors

const getClientFeatureState = createFeatureSelector<ClientState>(Features.Client);

export const getClients = createSelector(
    getClientFeatureState,
    state => state.clients
)

export const getClient = createSelector(
    getClientFeatureState,
    state => state.client
)
