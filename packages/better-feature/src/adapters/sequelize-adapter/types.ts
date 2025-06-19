import type { AdapterDebugLogs } from "../create-adapter/types";
import type { Sequelize } from "sequelize";

/**
 * Configuration options for the Sequelize adapter.
 */
export interface SequelizeAdapterConfig {
  /**
   * An existing Sequelize instance.
   */
  sequelize: Sequelize;

  /**
   * Enable debug logs for the adapter.
   *
   * @default false
   */
  debugLogs?: AdapterDebugLogs;

  /**
   * Use plural for table names.
   * Better Feature uses singular table names by default.
   * If your Sequelize models use plural table names, set this to true.
   *
   * @default false
   */
  usePlural?: boolean;
}

/**
 * Represents the Sequelize adapter instance.
 * We are not directly exporting the result of `sequelizeAdapter(config)`
 * because the `Adapter` type from `../../types` is generic and
 * would not provide specific typings for Sequelize.
 */
// export interface SequelizeAdapter extends Adapter {} // This might be refined later
