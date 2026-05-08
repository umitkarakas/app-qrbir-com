import { EventInvitationV1Schema, defaultEventInvitation } from "./v1";
import { migrations } from "./migrations";

export const CURRENT_VERSION = 1;
export const schema = EventInvitationV1Schema;
export const defaultContent = defaultEventInvitation;
export { migrations };
export type { EventInvitationV1Type as ContentType } from "./v1";
