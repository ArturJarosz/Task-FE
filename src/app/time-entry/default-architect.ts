import {Architect} from "../generated/models/architect";
import {User} from "../generated/models/user";

// Who new time is logged for: the architect linked to the logged-in user's account (Settings, Architect accounts), as
// people log their own time. Without one, the task's architect. Unknown until the user and the architects are loaded,
// since falling back before that would log the time for the wrong person
export function defaultArchitectId(architects: Architect[] | null, currentUser: User | null,
                                   taskArchitectId?: number): number | undefined {
    if (!currentUser || !architects?.length) {
        return undefined;
    }
    const ownArchitect = currentUser.id != null
        ? architects.find(architect => architect.linkedUser?.id === currentUser.id)
        : undefined;
    return ownArchitect?.id ?? taskArchitectId;
}
