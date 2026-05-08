import { BioLinkV1, BIO_LINK_DEFAULT_V1 } from "./v1";
import { migrations } from "./migrations";

export const CURRENT_VERSION = 1;
export const schema = BioLinkV1;
export const defaultContent = BIO_LINK_DEFAULT_V1;
export { migrations };
export type { BioLinkV1Type as ContentType } from "./v1";
