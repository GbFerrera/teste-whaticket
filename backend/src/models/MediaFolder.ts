import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";

import Company from "./Company";
import MediaFile from "./MediaFile";

@Table({
  tableName: "media_folders",
  underscored: true,
  timestamps: true
})
class MediaFolder extends Model<MediaFolder> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column({ field: "company_id" })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => MediaFile, "folderId")
  files: MediaFile[];

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}

export default MediaFolder;
