import {UserSummary} from "../generated/models/user-summary";

// A user created before Auth0 provided a profile has an empty name and email until the next login
export function accountName(user: UserSummary): string {
    return user.username || user.email || 'Unnamed account';
}
