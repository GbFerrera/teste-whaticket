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
  Unique,
  Default
} from "sequelize-typescript";

// import User from "./User";
// import Company from "./Company";

@Table({
  tableName: "UserGoogleCalendarIntegrations",
  name: {
    singular: "UserGoogleCalendarIntegration",
    plural: "UserGoogleCalendarIntegrations"
  }
})
class UserGoogleCalendarIntegration extends Model<UserGoogleCalendarIntegration> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ field: "user_id" })
  userId: number;

  @Column({ field: "company_id" })
  companyId: number;

  @Column
  googleUserId: string;

  @Column
  email: string;

  @Column(DataType.TEXT)
  accessToken: string;

  @Column(DataType.TEXT)
  refreshToken: string;

  @Column
  expiryDate: Date;

  @Column
  calendarId: string;

  @Default(true)
  @Column
  active: boolean;

  @Column(DataType.TEXT)
  syncToken: string;

  @Column
  lastSyncAt: Date;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  // @BelongsTo(() => User)
  // user: User;

  // @BelongsTo(() => Company)
  // company: Company;
}

export default UserGoogleCalendarIntegration;
