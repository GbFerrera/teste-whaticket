import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import CrmClient from "./CrmClient";
import User from "./User";

@Table({
  tableName: "crm_client_owners"
})
class CrmClientOwner extends Model<CrmClientOwner> {
  @ForeignKey(() => CrmClient)
  @Column({ field: "client_id" })
  clientId: number;

  @BelongsTo(() => CrmClient)
  client: CrmClient;

  @ForeignKey(() => User)
  @Column({ field: "user_id" })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}

export default CrmClientOwner;
