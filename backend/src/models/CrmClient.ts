import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  Default,
  BelongsToMany,
  HasMany,
  AfterUpdate,
  BeforeDestroy
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";
import Contact from "./Contact";
import Ticket from "./Ticket";
import CrmClientContact from "./CrmClientContact";
import CrmClientOwner from "./CrmClientOwner";
import CrmLead from "./CrmLead";

@Table({
  tableName: "crm_clients"
})
class CrmClient extends Model<CrmClient> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id" })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default("pf")
  @Column(DataType.STRING)
  type: "pf" | "pj";

  @Column(DataType.STRING)
  name: string;

  @Column({ field: "company_name", type: DataType.STRING })
  companyName: string;

  @Column(DataType.STRING)
  document: string;

  @Column({ field: "birth_date", type: DataType.DATEONLY })
  birthDate: Date;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  phone: string;

  @Column({ field: "zip_code", type: DataType.STRING })
  zipCode: string;

  @Column(DataType.STRING)
  address: string;

  @Column(DataType.STRING)
  number: string;

  @Column(DataType.STRING)
  complement: string;

  @Column(DataType.STRING)
  neighborhood: string;

  @Column(DataType.STRING)
  city: string;

  @Column(DataType.STRING)
  state: string;

  @Column({ field: "asaas_customer_id", type: DataType.STRING })
  asaasCustomerId: string | null;

  @Default("active")
  @Column(DataType.STRING)
  status: "active" | "inactive" | "blocked";

  @Column({ field: "client_since", type: DataType.DATEONLY })
  clientSince: Date;

  @ForeignKey(() => User)
  @Column({ field: "owner_user_id" })
  ownerUserId: number;

  @BelongsTo(() => User, "ownerUserId")
  owner: User;

  @Column(DataType.TEXT)
  notes: string;

  @ForeignKey(() => Contact)
  @Column({ field: "contact_id" })
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Ticket)
  @Column({ field: "primary_ticket_id" })
  primaryTicketId: number;

  @BelongsTo(() => Ticket, "primaryTicketId")
  primaryTicket: Ticket;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => CrmLead, "convertedClientId")
  leads: CrmLead[];

  @HasMany(() => CrmClientContact)
  clientContacts: CrmClientContact[];

  @BelongsToMany(() => Contact, () => CrmClientContact, "clientId", "contactId")
  contacts: Contact[];

  @HasMany(() => CrmClientOwner)
  clientOwners: CrmClientOwner[];

  @BelongsToMany(() => User, () => CrmClientOwner, "clientId", "userId")
  owners: User[];

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  @AfterUpdate
  static async syncToLead(instance: CrmClient) {
    // Import dinâmico para evitar circular dependency
    const { default: syncClientToLead } = await import("../services/CrmClientService/helpers/syncClientToLead");
    
    try {
      await syncClientToLead({
        client: instance,
        companyId: instance.companyId
      });
    } catch (error) {
      console.error("[CrmClient Model] Error syncing to Lead:", error);
    }
  }

  @BeforeDestroy
  static async handleCascadeDelete(instance: CrmClient) {
    // Import dinâmico para evitar circular dependency
    const { default: handleClientDeleteCascade } = await import("../services/CrmClientService/handleClientDeleteCascade");
    
    try {
      await handleClientDeleteCascade({
        client: instance,
        companyId: instance.companyId
      });
    } catch (error) {
      console.error("[CrmClient Model] Error handling cascade delete:", error);
    }
  }
}

export default CrmClient;
