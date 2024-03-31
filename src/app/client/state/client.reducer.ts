import {createReducer, on} from "@ngrx/store";
import {ClientState, initialState} from "./client.state";
import {createClientSuccess, loadClientsSuccess, loadClientSuccess, removeClientSuccess} from "./client.action";

export const clientReducer = createReducer<ClientState>(
    initialState,
    on(loadClientsSuccess, (state, action): ClientState => {
        return {
            ...state,
            error: '',
            clients: action.clients,
            clientsNeedRefresh: false
        }
    }),
    on(loadClientSuccess, (state, action): ClientState => {
        return {
            ...state,
            error: '',
            client: action.client
        }
    }),

    on(createClientSuccess, (state, action): ClientState => {
        return {
            ...state,
            error: '',
            clientsNeedRefresh: true
        }
    }),

    on(removeClientSuccess, (state, action): ClientState => {
        return {
            ...state,
            error: '',
            clientsNeedRefresh: true
        }
    })
)
