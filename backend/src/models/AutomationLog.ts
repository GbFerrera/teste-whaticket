import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import Contact from "./Contact";
import Ticket from "./Ticket";

@Table({ tableName: "AutomationLogs" })
class AutomationLog extends Model<AutomationLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => require("./Automation").default)
  @Column
  automationId: number;

  @BelongsTo(() => require("./Automation").default)
  automation: any;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @Default("pending")
  @Column
  status: string;

  @Column
  executedAt: Date;

  @Default({})
  @Column(DataTypes.JSONB)
  result: any;

  @Column(DataTypes.TEXT)
  error: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default AutomationLog;
