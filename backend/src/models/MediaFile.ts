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
  BelongsTo
} from "sequelize-typescript";

import Company from "./Company";
import MediaFolder from "./MediaFolder";

@Table({
  tableName: "media_files",
  underscored: true,
  timestamps: true
})
class MediaFile extends Model<MediaFile> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => MediaFolder)
  @AllowNull(false)
  @Column({ field: "folder_id" })
  folderId: number;

  @BelongsTo(() => MediaFolder)
  folder: MediaFolder;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column({ field: "company_id" })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @AllowNull(false)
  @Column({ field: "original_name", type: DataType.STRING(255) })
  originalName: string;

  @AllowNull(true)
  @Column({ field: "custom_name", type: DataType.STRING(255) })
  customName?: string;

  @AllowNull(false)
  @Column({ field: "mime_type", type: DataType.STRING(128) })
  mimeType: string;

  @AllowNull(false)
  @Column(DataType.BIGINT)
  size: number;

  @AllowNull(false)
  @Column({ field: "storage_path", type: DataType.TEXT })
  storagePath: string;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}

export default MediaFile;
