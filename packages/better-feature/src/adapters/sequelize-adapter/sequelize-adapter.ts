import { createAdapter } from "../create-adapter";
import type { Where } from "../../types";
import type { SequelizeAdapterConfig } from "./types";
import type { Model, ModelStatic, Sequelize, WhereOptions } from "sequelize";
import { Op } from "sequelize"; // Make sure Op is imported

// Helper function to get the Sequelize model
function getSequelizeModel(sequelize: Sequelize, modelName: string): ModelStatic<Model<any, any>> {
  const model = sequelize.models[modelName];
  if (!model) {
    throw new Error(`Model ${modelName} not found in Sequelize instance.`);
  }
  return model;
}

// Helper function to convert Better Feature 'Where' to Sequelize 'WhereOptions'
function convertWhereToSequelize(
    bfWhere: Where[] | undefined,
    // modelSchema: ModelStatic<Model<any, any>> // modelSchema might not be needed if field names are directly used
): WhereOptions<any> | undefined {
    if (!bfWhere || bfWhere.length === 0) {
        return undefined;
    }

    const processCondition = (condition: Where) => {
        const { field, value, operator = "eq", connector } = condition; // Connector is per condition in BetterFeature
        let sequelizeOp;

        switch (operator.toLowerCase()) {
            case "eq":
                sequelizeOp = Op.eq;
                break;
            case "ne":
                sequelizeOp = Op.ne;
                break;
            case "gt":
                sequelizeOp = Op.gt;
                break;
            case "gte":
                sequelizeOp = Op.gte;
                break;
            case "lt":
                sequelizeOp = Op.lt;
                break;
            case "lte":
                sequelizeOp = Op.lte;
                break;
            case "in":
                if (!Array.isArray(value)) throw new Error("IN operator requires an array value.");
                sequelizeOp = Op.in;
                break;
            case "notin": // Assuming 'notin' maps to Op.notIn
                if (!Array.isArray(value)) throw new Error("NOTIN operator requires an array value.");
                sequelizeOp = Op.notIn;
                break;
            case "contains":
                sequelizeOp = Op.like; // Op.like is SQL LIKE. For true 'contains', value might need %value%
                return { [field]: { [Op.like]: `%${value}%` } };
            case "startswith":
                sequelizeOp = Op.like;
                return { [field]: { [Op.like]: `${value}%` } };
            case "endswith":
                sequelizeOp = Op.like;
                return { [field]: { [Op.like]: `%${value}` } };
            // TODO: Add cases for other operators like 'isNull', 'isNotNull', 'between', etc. if supported by BetterFeature
            default:
                console.warn(`Unsupported operator: ${operator}. Defaulting to equality.`);
                sequelizeOp = Op.eq;
        }
        return { [field]: { [sequelizeOp]: value } };
    };

    // Separate conditions by their connectors (AND/OR)
    // BetterFeature's Where[] has `connector` per condition, which is a bit different from Sequelize's Op.and/Op.or arrays.
    // A common approach: if any OR is present, group ANDs within ORs, or treat mixed as complex.
    // For simplicity here: group all ANDs and all ORs separately.
    // This might not perfectly map all complex BetterFeature queries.
    // A more robust solution might involve building a nested structure if BF supports it.

    const andConditions: any[] = [];
    const orConditions: any[] = [];

    bfWhere.forEach(condition => {
        if (condition.connector === "OR") {
            orConditions.push(processCondition(condition));
        } else {
            // Default to AND if connector is not OR or is undefined
            andConditions.push(processCondition(condition));
        }
    });

    const result: WhereOptions<any> = {};

    if (andConditions.length > 0) {
        result[Op.and] = andConditions;
    }

    if (orConditions.length > 0) {
        // If there are AND conditions, the OR conditions should be at the same level for a top-level OR effect among them.
        // If you want ORs to be alternative to the block of ANDs, structure differs.
        // Current: (ANDs) AND (ORs as a block, if result[Op.and] is also populated, effectively (ANDs) AND (OR_1 OR OR_2 ...))
        // To make it (ANDs) OR (ORs), the logic would be more complex, often requiring a root Op.or.
        // For now, let's assume OR conditions are OR'd together, and this group is AND'd with AND conditions.
        // This might need refinement based on BetterFeature's expected logic.
        // If only ORs, it's simple: { [Op.or]: [...] }
        if (andConditions.length === 0 && orConditions.length > 0) {
             return { [Op.or]: orConditions };
        }
        // If both andConditions and orConditions exist, Sequelize handles this as an AND between the [Op.and] array and each condition in the [Op.or] array if they are at the same level.
        // To make it (all ANDs) AND (any of ORs), it would be result[Op.or] = orConditions; (this is what happens if we just add it)
        // To make it (all ANDs) OR (all ORs grouped), we'd need: { [Op.or]: [ {[Op.and]: andConditions}, {[Op.or]: orConditions} ] }
        // The current simple approach:
        if (orConditions.length > 0) {
           result[Op.or] = orConditions; // This means (ANDs) AND (OR_1 OR OR_2 ...)
        }
    }

    if (Object.keys(result).length === 0) return undefined; // Should not happen if bfWhere is not empty

    // If only one group (only ANDs or only ORs), no need for explicit Op.and/Op.or at the root if it's just one condition.
    // However, Sequelize handles arrays of conditions gracefully.
    // If bfWhere had only one condition, it would be e.g. { [Op.and]: [{ field: { [Op.eq]: value } }] }
    // which is fine.

    return result;
}

export const sequelizeAdapter = (config: SequelizeAdapterConfig) => {
  const { sequelize, ...adapterSpecificConfig } = config;

  return createAdapter({
    config: {
      adapterId: "sequelize",
      adapterName: "Sequelize Adapter",
      usePlural: adapterSpecificConfig.usePlural,
      debugLogs: adapterSpecificConfig.debugLogs,
      // Sequelize generally supports booleans and dates natively.
      // JSON support depends on the dialect (e.g., PostgreSQL JSONB).
      // For now, let's assume basic support. Dialect-specific handling can be added.
      supportsBooleans: true,
      supportsDates: true,
      supportsJSON: true, // This might need to be dialect-dependent
      supportsNumericIds: true, // Assuming IDs are numeric by default, can be configured in model
    },
    adapter: ({ getFieldName, getModelName: getBetterFeatureModelName, schema: betterFeatureSchema }) => {
      // getModelName from createAdapter context refers to the BetterFeature model name.
      // We need to map this to the Sequelize model name if they differ (e.g. due to pluralization)

      return {
        async create({ data, model: modelInput }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          // TODO: transformInput from createAdapter should handle mapping `data` keys
          // to the correct column names based on `getFieldName`.
          // Sequelize's `create` method expects keys to match column names.
          const record = await SequelizeModel.create(data);
          return record.get({ plain: true });
        },

        async findOne({ model: modelInput, where: bfWhere, select }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          const where = convertWhereToSequelize(bfWhere); // modelSchema removed

          const queryOptions: any = { where };
          if (select && select.length > 0) {
            queryOptions.attributes = select;
          }

          const record = await SequelizeModel.findOne(queryOptions);
          return record ? record.get({ plain: true }) : null;
        },

        async findMany({ model: modelInput, where: bfWhere, limit, offset, sortBy }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          const where = convertWhereToSequelize(bfWhere); // modelSchema removed

          const queryOptions: any = { where };
          if (limit !== undefined) queryOptions.limit = limit;
          if (offset !== undefined) queryOptions.offset = offset;
          if (sortBy) {
            // getFieldName needs to be used here for the sortBy.field
            queryOptions.order = [[getFieldName({model: modelInput, field: sortBy.field}), sortBy.direction.toUpperCase()]];
          }

          const records = await SequelizeModel.findAll(queryOptions);
          return records.map(r => r.get({ plain: true }));
        },

        async update({ model: modelInput, where: bfWhere, update: values }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          const where = convertWhereToSequelize(bfWhere); // modelSchema removed

          // Sequelize's update returns [affectedCount, affectedRows[]] for some dialects (e.g. Postgres with returning: true)
          // For simplicity, we'll refetch. Or, adjust based on dialect and `returning` capabilities.
          // `createAdapter`'s `transformOutput` will be applied to the result of this.
          const [affectedCount] = await SequelizeModel.update(values, { where });

          if (affectedCount > 0 && bfWhere) {
            // Refetch to return the updated record, as `update` might not return it directly in all cases.
            // This assumes `bfWhere` can uniquely identify the updated record.
            // This is a simplification; complex updates might need more sophisticated handling.
            const updatedRecord = await SequelizeModel.findOne({ where });
            return updatedRecord ? updatedRecord.get({ plain: true }) : null;
          }
          return null;
        },

        async updateMany({ model: modelInput, where: bfWhere, update: values }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          const where = convertWhereToSequelize(bfWhere); // modelSchema removed
          const [affectedCount] = await SequelizeModel.update(values, { where });
          return affectedCount;
        },

        async delete({ model: modelInput, where: bfWhere }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          const where = convertWhereToSequelize(bfWhere); // modelSchema removed
          await SequelizeModel.destroy({ where });
          // `delete` in BetterFeature adapters doesn't typically return a value.
        },

        async deleteMany({ model: modelInput, where: bfWhere }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          const where = convertWhereToSequelize(bfWhere); // modelSchema removed
          const affectedCount = await SequelizeModel.destroy({ where });
          return affectedCount;
        },

        async count({ model: modelInput, where: bfWhere }) {
          const modelName = getBetterFeatureModelName(modelInput);
          const SequelizeModel = getSequelizeModel(sequelize, modelName);
          const where = convertWhereToSequelize(bfWhere); // modelSchema removed
          return await SequelizeModel.count({ where });
        },

        // `createSchema` is optional. If Sequelize handles migrations externally,
        // this might not be needed or could be a no-op.
        // For now, let's leave it undefined.
        // async createSchema({ tables }) {
        //   // Implementation depends on how schema/migrations are managed with Sequelize
        // },

        // `options` can pass through any Sequelize-specific configurations from the adapter.
        options: adapterSpecificConfig,
      };
    },
  });
};
