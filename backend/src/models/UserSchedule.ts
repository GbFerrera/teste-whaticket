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
  Default,
  HasMany,
  Unique
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import Appointment from "./Appointment";
import UserGoogleCalendarIntegration from "./UserGoogleCalendarIntegration";

@Table({ tableName: "user_schedules" })
class UserSchedule extends Model<UserSchedule> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING(100))
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Default(true)
  @Column
  active: boolean;

  @Unique
  @ForeignKey(() => User)
  @Column({ field: "user_id" })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @Column({ field: "company_id" })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Appointment)
  appointments: Appointment[];

  @ForeignKey(() => UserGoogleCalendarIntegration)
  @Column({ field: "user_google_calendar_integration_id", allowNull: true })
  userGoogleCalendarIntegrationId: number;

  @BelongsTo(() => UserGoogleCalendarIntegration)
  googleCalendarIntegration: UserGoogleCalendarIntegration;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}

export default UserSchedule;
