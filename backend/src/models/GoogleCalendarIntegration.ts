import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";

@Table({
  tableName: "UserGoogleCalendarIntegrations",
  name: {
    singular: "UserGoogleCalendarIntegration",
    plural: "UserGoogleCalendarIntegrations"
  }
})
class GoogleCalendarIntegration extends Model<GoogleCalendarIntegration> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id" })
  companyId: number;

  @ForeignKey(() => User)
  @Column({ field: "user_id" })
  userId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => User)
  user: User;

  @Column
  googleUserId: string;

  @Column
  email: string;

  @Column
  accessToken: string;

  @Column
  refreshToken: string;

  @Column
  expiryDate: Date;

  @Column
  calendarId: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GoogleCalendarIntegration;
