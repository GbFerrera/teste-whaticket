import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Default,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";
import ScheduledDispatchLog from "./ScheduledDispatchLog";

@Table({
  tableName: "scheduled_dispatchers"
})
class ScheduledDispatcher extends Model<ScheduledDispatcher> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.INTEGER })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING)
  title: string;

  @Column({ field: "message_template", type: DataType.TEXT })
  messageTemplate: string;

  @Column({ field: "event_type", type: DataType.STRING })
  eventType: string;

  @ForeignKey(() => Whatsapp)
  @Column({ field: "whatsapp_id", type: DataType.INTEGER })
  whatsappId: number | null;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @Column({ field: "start_time", type: DataType.STRING })
  startTime: string;

  @Column({ field: "send_interval_seconds", type: DataType.INTEGER })
  sendIntervalSeconds: number;

  @Column({ field: "days_before_due", type: DataType.INTEGER })
  daysBeforeDue: number | null;

  @Column({ field: "days_after_due", type: DataType.INTEGER })
  daysAfterDue: number | null;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @HasMany(() => ScheduledDispatchLog)
  logs: ScheduledDispatchLog[];

  @CreatedAt
  @Column({ field: "created_at", type: DataType.DATE })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at", type: DataType.DATE })
  updatedAt: Date;
}

export default ScheduledDispatcher;
