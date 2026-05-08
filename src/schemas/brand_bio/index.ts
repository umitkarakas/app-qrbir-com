import { BrandBioV1Schema, defaultBrandBio } from "./v1";
import { migrations } from "./migrations";

export const CURRENT_VERSION = 1;
export const schema = BrandBioV1Schema;
export const defaultContent = defaultBrandBio;
export { migrations };
export type { BrandBioV1Type as ContentType } from "./v1";
