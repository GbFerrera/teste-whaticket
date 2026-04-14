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
  AfterUpdate
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";
import Contact from "./Contact";
import Ticket from "./Ticket";
import CrmClient from "./CrmClient";

@Table({
  tableName: "crm_leads"
})
class CrmLead extends Model<CrmLead> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id" })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  name: string;

  @Column
  email: string;

  @Column
  phone: string;

  @Column
  lid: string;

  @Column({ field: "birth_date", type: DataType.DATEONLY })
  birthDate: Date;

  @Column
  document: string;

  @Column({ field: "company_name" })
  companyName: string;

  @Column
  position: string;

  @Column
  source: string;

  @Column
  campaign: string;

  @Column
  medium: string;

  @Default("new")
  @Column
  status: string;

  @Default(0)
  @Column
  score: number;

  @Column
  temperature: string;

  @ForeignKey(() => User)
  @Column({ field: "owner_user_id" })
  ownerUserId: number;

  @BelongsTo(() => User, "ownerUserId")
  owner: User;

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

  @ForeignKey(() => CrmClient)
  @Column({ field: "converted_client_id" })
  convertedClientId: number;

  @BelongsTo(() => CrmClient, "convertedClientId")
  convertedClient: CrmClient;

  @Column({ field: "converted_at", type: DataType.DATE })
  convertedAt: Date;

  @Column(DataType.TEXT)
  notes: string;

  @Column({ field: "last_activity_at", type: DataType.DATE })
  lastActivityAt: Date;

  @Default("novo")
  @Column({ field: "lead_status" })
  leadStatus: string;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  @AfterUpdate
  static async syncToContact(instance: CrmLead) {
    // Import dinâmico para evitar circular dependency
    const { default: syncLeadToContact } = await import("../services/CrmLeadService/helpers/syncLeadToContact");
    
    try {
      await syncLeadToContact({
        lead: instance,
        companyId: instance.companyId
      });
    } catch (error) {
      console.error("[CrmLead Model] Error syncing to Contact:", error);
    }
  }

  @AfterUpdate
  static async syncToClient(instance: CrmLead) {
    // Import dinâmico para evitar circular dependency
    const { default: syncLeadToClient } = await import("../services/CrmClientService/helpers/syncLeadToClient");
    
    try {
      await syncLeadToClient({
        lead: instance,
        companyId: instance.companyId
      });
    } catch (error) {
      console.error("[CrmLead Model] Error syncing to Client:", error);
    }
  }
}

export default CrmLead;
