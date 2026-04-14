import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

import CrmClient from "./CrmClient";
import Contact from "./Contact";

@Table({
  tableName: "crm_client_contacts"
})
class CrmClientContact extends Model<CrmClientContact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => CrmClient)
  @Column({ field: "client_id" })
  clientId: number;

  @BelongsTo(() => CrmClient)
  client: CrmClient;

  @ForeignKey(() => Contact)
  @Column({ field: "contact_id" })
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @Column
  role: string;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}

export default CrmClientContact;
