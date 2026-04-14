import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
  DataType,
  Default,
  AutoIncrement
} from "sequelize-typescript";
import Ticket from "./Ticket";
import Company from "./Company";

@Table
class FollowUp extends Model<FollowUp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @AllowNull(true)
  @Column
  flowNodeId?: string;

  @Column
  actionType: string;

  @Column(DataType.JSON)
  actionPayload: any;

  @Column
  scheduledAt: Date;

  @Default('pending')
  @Column(DataType.ENUM('pending', 'completed', 'failed', 'cancelled'))
  status: 'pending' | 'completed' | 'failed' | 'cancelled';

  @AllowNull(true)
  @Column
  executedAt?: Date;

  @AllowNull(true)
  @Column(DataType.TEXT)
  error?: string;

  @BelongsTo(() => Ticket)
  ticket?: Ticket;

  @BelongsTo(() => Company)
  company?: Company;
}

export default FollowUp;
