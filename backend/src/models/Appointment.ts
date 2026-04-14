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
  ForeignKey,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import UserSchedule from "./UserSchedule";
import Servico from "./Servico";
import CrmClient from "./CrmClient";
import CrmLead from "./CrmLead";
import Contact from "./Contact";

@Table({ tableName: "appointments" })
class Appointment extends Model<Appointment> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING(200))
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @Column({ field: "start_datetime", type: DataType.DATE })
  startDatetime: Date;

  @Default(60)
  @Column({ field: "duration_minutes" })
  durationMinutes: number;

  @Default("scheduled")
  @Column(DataType.STRING(20))
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

  @Column({ field: "google_event_id", allowNull: true })
  googleEventId: string;

  @ForeignKey(() => UserSchedule)
  @Column({ field: "schedule_id" })
  scheduleId: number;

  @BelongsTo(() => UserSchedule)
  schedule: UserSchedule;

  @ForeignKey(() => Servico)
  @Column({ field: "service_id" })
  serviceId: number;

  @BelongsTo(() => Servico)
  service: Servico;

  @ForeignKey(() => CrmClient)
  @Column({ field: "client_id" })
  clientId: number;

  @BelongsTo(() => CrmClient)
  client: CrmClient;

  @ForeignKey(() => Contact)
  @Column({ field: "contact_id" })
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => CrmLead)
  @Column({ field: "lead_id" })
  leadId: number;

  @BelongsTo(() => CrmLead)
  lead: CrmLead;

  @ForeignKey(() => Company)
  @Column({ field: "company_id" })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}

export default Appointment;
