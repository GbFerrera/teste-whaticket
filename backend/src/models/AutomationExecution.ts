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

@Table({ tableName: "AutomationExecutions" })
class AutomationExecution extends Model<AutomationExecution> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => require("./Automation").default)
  @Column
  automationId: number;

  @BelongsTo(() => require("./Automation").default)
  automation: any;

  @ForeignKey(() => require("./AutomationAction").default)
  @Column
  automationActionId: number;

  @BelongsTo(() => require("./AutomationAction").default)
  automationAction: any;

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

  @Column
  scheduledAt: Date;

  @Default("scheduled")
  @Column
  status: string;

  @Default(0)
  @Column
  attempts: number;

  @Column
  lastAttemptAt: Date;

  @Column
  completedAt: Date;

  @Column(DataTypes.TEXT)
  error: string;

  @Default({})
  @Column(DataTypes.JSONB)
  metadata: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default AutomationExecution;
