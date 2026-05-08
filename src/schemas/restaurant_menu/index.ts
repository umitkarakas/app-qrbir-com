import { RestaurantMenuV1, RESTAURANT_MENU_DEFAULT_V1 } from "./v1";
import { migrations } from "./migrations";

export const CURRENT_VERSION = 1;
export const schema = RestaurantMenuV1;
export const defaultContent = RESTAURANT_MENU_DEFAULT_V1;
export { migrations };
export type { RestaurantMenuV1Type as ContentType } from "./v1";
