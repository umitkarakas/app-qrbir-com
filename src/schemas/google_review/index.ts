import { GoogleReviewV1, GOOGLE_REVIEW_DEFAULT_V1 } from "./v1";
import { migrations } from "./migrations";

export const CURRENT_VERSION = 1;
export const schema = GoogleReviewV1;
export const defaultContent = GOOGLE_REVIEW_DEFAULT_V1;
export { migrations };
export type { GoogleReviewV1Type as ContentType } from "./v1";
