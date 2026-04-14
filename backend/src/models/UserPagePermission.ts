import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BeforeUpdate,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";

@Table
class UserPagePermission extends Model<UserPagePermission> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  pagePath: string;

  @Column
  canAccess: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BeforeUpdate
  static updateTimestamp = (instance: UserPagePermission): void => {
    instance.updatedAt = new Date();
  };
}

export default UserPagePermission;
