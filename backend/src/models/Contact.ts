import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  BeforeCreate,
  BeforeUpdate,
  AfterCreate,
  AfterUpdate
} from "sequelize-typescript";
import { DataType } from "sequelize-typescript";
import ContactCustomField from "./ContactCustomField";
import Ticket from "./Ticket";
import Company from "./Company";
import Schedule from "./Schedule";
import ContactTag from "./ContactTag";
import Tag from "./Tag";
import ContactWallet from "./ContactWallet";
import User from "./User";
import Whatsapp from "./Whatsapp";
import CrmClient from "./CrmClient";
import CrmClientContact from "./CrmClientContact";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(false)
  @Unique("contacts_company_number_unique")
  @Column
  number: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Default("")
  @Column
  profilePicUrl: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Default(false)
  @Column
  disableBot: boolean;

  @Default(true)
  @Column
  acceptAudioMessage: boolean;

  @Default(true)
  @Column
  active: boolean;

  @Default("whatsapp")
  @Column
  channel: string;

  @Column(DataType.JSONB)
  files: any;

  @Column
  cpfCnpj: string;

  @Column
  address: string;

  @Column
  info: string;

  @Column
  birthday: Date;

  @Column
  anniversary: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @HasMany(() => ContactTag)
  contactTags: ContactTag[];

  @BelongsToMany(() => Tag, () => ContactTag)
  tags: Tag[];

  @Unique("contacts_company_number_unique")
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Schedule, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
    hooks: true
  })
  schedules: Schedule[];

  @Column
  remoteJid: string;

  @Column
  lid: string;

  @Default(false)
  @Column
  isLid: boolean;

  @Default(false)
  @Column
  savedToPhone: boolean;

  @Column
  savedToPhoneAt: Date;

  @Column
  savedToPhoneReason: string;

  @Default(0)
  @Column
  potentialScore: number;

  @Default(false)
  @Column
  isPotential: boolean;

  @Default("unknown")
  @Column
  lidStability: string;

  @Column
  lgpdAcceptedAt: Date;

  @Column
  pictureUpdated: boolean;

  @Column
  get urlPicture(): string | null {
    const picture = this.getDataValue("urlPicture");

    if (!picture) {
      return null;
    }

    const frontendPlaceholder = `${process.env.FRONTEND_URL}/nopicture.png`;

    // Quando o WhatsApp devolve um link direto (pps.whatsapp.net), o frontend
    // não consegue carregá-lo (403). Neste caso, usamos o placeholder padrão
    // para evitar múltiplas tentativas e travamentos no envio.
    if (/^https?:\/\//i.test(picture)) {
      return picture.includes("pps.whatsapp.net") ? frontendPlaceholder : picture;
    }

    if (picture === "nopicture.png") {
      return frontendPlaceholder;
    }

    const baseUrl = `${process.env.BACKEND_URL}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}`;
    return `${baseUrl}/public/company${this.companyId}/contacts/${picture}`;
  }

  @BelongsToMany(() => User, () => ContactWallet, "contactId", "walletId")
  wallets: ContactWallet[];

  @HasMany(() => ContactWallet)
  contactWallets: ContactWallet[];

  @BelongsToMany(() => CrmClient, () => CrmClientContact, "contactId", "clientId")
  crmClients: CrmClient[];

  @HasMany(() => CrmClientContact)
  clientContacts: CrmClientContact[];

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  // Hooks para debug do campo LID
  @BeforeCreate
  static logBeforeCreate(instance: Contact) {
    console.log("[Contact Model] BeforeCreate:", {
      name: instance.name,
      number: instance.number,
      lid: instance.lid,
      remoteJid: instance.remoteJid,
      isLid: instance.isLid
    });
  }

  @AfterCreate
  static logAfterCreate(instance: Contact) {
    console.log("[Contact Model] AfterCreate - Contact created with ID:", instance.id, {
      name: instance.name,
      number: instance.number,
      lid: instance.lid,
      remoteJid: instance.remoteJid,
      isLid: instance.isLid
    });
  }

  @AfterCreate
  static async relinkToExistingRecords(instance: Contact) {
    // Import dinâmico para evitar circular dependency
    const { default: relinkContactToExistingRecords } = await import("../services/ContactServices/relinkContactToExistingRecords");
    
    try {
      await relinkContactToExistingRecords({
        contact: instance,
        companyId: instance.companyId
      });
    } catch (error) {
      console.error("[Contact Model] Error relinking to existing records:", error);
    }
  }

  @BeforeUpdate
  static logBeforeUpdate(instance: Contact) {
    console.log("[Contact Model] BeforeUpdate - Contact ID:", instance.id, {
      name: instance.name,
      number: instance.number,
      lid: instance.lid,
      remoteJid: instance.remoteJid,
      isLid: instance.isLid,
      changed: instance.changed()
    });
  }

  @AfterUpdate
  static logAfterUpdate(instance: Contact) {
    console.log("[Contact Model] AfterUpdate - Contact ID:", instance.id, {
      name: instance.name,
      number: instance.number,
      lid: instance.lid,
      remoteJid: instance.remoteJid,
      isLid: instance.isLid
    });
  }

  @AfterUpdate
  static async syncToLead(instance: Contact) {
    // Import dinâmico para evitar circular dependency
    const { default: syncContactToLead } = await import("../services/CrmLeadService/helpers/syncContactToLead");
    
    try {
      await syncContactToLead({
        contact: instance,
        companyId: instance.companyId
      });
    } catch (error) {
      console.error("[Contact Model] Error syncing to Lead:", error);
    }
  }
}

export default Contact;
