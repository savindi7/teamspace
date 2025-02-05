import { Session as AuthSession } from "@auth/core/types";
import { User } from "./user";

export interface CustomSession extends Omit<AuthSession, "user"> {
    access_token?: string;
    scope?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    user: User;
}

export default CustomSession;
