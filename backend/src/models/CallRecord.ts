import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import Contact from "./Contact";
import Whatsapp from "./Whatsapp";
import Ticket from "./Ticket";
import User from "./User";

@Table({ tableName: "CallRecords" })
class CallRecord extends Model<CallRecord> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  callId: string;

  @Column
  type: string; // "incoming" | "outgoing"

  @Column
  status: string; // "missed" | "answered" | "rejected" | "busy" | "failed"

  @Column
  fromNumber: string;

  @Column
  toNumber: string;

  @Column
  duration: number; // duração em segundos

  @Column(DataType.TEXT)
  recordingUrl: string;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  callStartedAt: Date;

  @Column
  callEndedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CallRecord;
