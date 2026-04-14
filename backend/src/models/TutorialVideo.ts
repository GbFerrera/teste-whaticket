import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

@Table({
  tableName: "tutorial_videos",
  timestamps: true,
  underscored: true
})
class TutorialVideo extends Model<TutorialVideo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    validate: {
      len: [0, 300]
    }
  })
  description: string;

  @AllowNull(true)
  @Column(DataType.STRING(512))
  videoUrl: string;

  @AllowNull(true)
  @Column(DataType.STRING(512))
  thumbnailUrl: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @AllowNull(false)
  @Default(true)
  @Column
  isActive: boolean;

  @AllowNull(false)
  @Default(0)
  @Column
  viewsCount: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TutorialVideo;
