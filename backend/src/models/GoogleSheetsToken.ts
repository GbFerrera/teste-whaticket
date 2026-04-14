import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table({
  tableName: "GoogleSheetsTokens"
})
class GoogleSheetsToken extends Model<GoogleSheetsToken> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  googleUserId: string;

  @Column
  email: string;

  @Column(DataType.TEXT)
  accessToken: string;

  @Column(DataType.TEXT)
  refreshToken: string;

  @Column(DataType.DATE)
  expiryDate: Date;

  @Column(DataType.JSONB)
  rawTokens: Record<string, any>;
}

export default GoogleSheetsToken;
