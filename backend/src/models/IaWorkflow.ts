import { Model, DataTypes } from "sequelize";
import sequelize from "../database";

class IaWorkflow extends Model {
  public id!: number;
  public companyId!: number;
  public orchestratorPromptId!: number;
  public agentPromptId!: number;
  public alias!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

IaWorkflow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orchestratorPromptId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    agentPromptId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "IaWorkflow"
  }
);

export default IaWorkflow;
