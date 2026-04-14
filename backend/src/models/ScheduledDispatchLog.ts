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
  UpdatedAt
} from "sequelize-typescript";
import ScheduledDispatcher from "./ScheduledDispatcher";
import Contact from "./Contact";
import Ticket from "./Ticket";
import Company from "./Company";

@Table({
  tableName: "scheduled_dispatch_logs"
})
class ScheduledDispatchLog extends Model<ScheduledDispatchLog> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => ScheduledDispatcher)
  @Column({ field: "dispatcher_id", type: DataType.INTEGER })
  dispatcherId: number;

  @BelongsTo(() => ScheduledDispatcher)
  dispatcher: ScheduledDispatcher;

  @ForeignKey(() => Contact)
  @Column({ field: "contact_id", type: DataType.INTEGER })
  contactId: number | null;

  @BelongsTo(() => Contact)
  contact: Contact | null;

  @ForeignKey(() => Ticket)
  @Column({ field: "ticket_id", type: DataType.INTEGER })
  ticketId: number | null;

  @BelongsTo(() => Ticket)
  ticket: Ticket | null;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.INTEGER })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING)
  status: string;

  @Column({ field: "error_message", type: DataType.TEXT })
  errorMessage: string | null;

  @Column({ field: "sent_at", type: DataType.DATE })
  sentAt: Date | null;

  @CreatedAt
  @Column({ field: "created_at", type: DataType.DATE })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at", type: DataType.DATE })
  updatedAt: Date;
}

export default ScheduledDispatchLog;
