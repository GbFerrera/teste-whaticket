import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType
} from "sequelize-typescript";

@Table
class Translation extends Model<Translation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  languageCode: string;

  @Column
  key: string;

  @Column(DataType.TEXT)
  value: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Translation;
