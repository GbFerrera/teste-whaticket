import {
  Model,
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table({
  tableName: "FlowCampaigns"
})
export class FlowCampaignModel extends Model<FlowCampaignModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  companyId: number;

  @Column
  userId: number;

  @Column
  name: string;

  @Column
  flowId: number;

  @Column
  phrase: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  phrases: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  matchType: string | null;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp

  @Column
  status: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
