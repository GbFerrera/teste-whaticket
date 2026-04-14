// @ts-nocheck

import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import { DataType } from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "slider_home" })
class SliderBanner extends Model<SliderBanner> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  image: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column({ defaultValue: 1 })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default SliderBanner;
