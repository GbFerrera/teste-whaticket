import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AutoIncrement,
  Default,
  BeforeCreate,
  BelongsToMany,
  AllowNull,
  DataType
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";

import Contact from "./Contact";
import Message from "./Message";
import Queue from "./Queue";
import User from "./User";
import Whatsapp from "./Whatsapp";
import Company from "./Company";
import Tag from "./Tag";
import TicketTag from "./TicketTag";
import QueueIntegrations from "./QueueIntegrations";
import CrmLead from "./CrmLead";
import CrmClient from "./CrmClient";
import FollowUp from "./FollowUp";
import { format } from "date-fns";


@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: "pending" })
  status: string;

  @Column
  unreadMessages: number;

  @Column
  leadValue: number;

  @Column
  flowWebhook: boolean;

  @Column
  lastFlowId: string;

  @Column
  hashFlowId: string;

  @Column
  flowStopped: string;

  @Column(DataType.JSON)
  dataWebhook: {} | null;;

  @Column
  lastMessage: string;

  @Column
  lid: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Column
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @Default(false)
  @Column
  isBot: boolean;

  @HasMany(() => Message)
  messages: Message[];

  @HasMany(() => TicketTag)
  ticketTags: TicketTag[];

  @HasMany(() => FollowUp)
  followUps: FollowUp[];

  @BelongsToMany(() => Tag, () => TicketTag)
  tags: Tag[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default(uuidv4())
  @Column
  uuid: string;

  @Default("whatsapp")
  @Column
  channel: string;

  @AllowNull(false)
  @Default(0)
  @Column
  amountUsedBotQueues: number;

  @AllowNull(false)
  @Default(0)
  @Column
  amountUsedBotQueuesNPS: number;

  // Campos para waitQuestion
  @Default(false)
  @Column
  waitingQuestion: boolean;

  @AllowNull
  @Column
  questionNodeId: string;

  @Column(DataType.JSON)
  questionOptions: {} | null;

  @Default(0)
  @Column
  questionAttempts: number;

  @Default(3)
  @Column
  maxQuestionAttempts: number;

  @Default(0)
  @Column
  botAttempts: number;

  @Default(false)
  @Column
  timeoutEnabled: boolean;

  @AllowNull
  @Column
  timeoutAt: Date;

  @BeforeCreate
  static setUUID(ticket: Ticket) {
    ticket.uuid = uuidv4();
  }

  @Default(false)
  @Column
  fromMe: boolean;

  @Default(false)
  @Column
  sendInactiveMessage: boolean;

  @Column({
    type: DataType.JSONB,
    defaultValue: []
  })
  productsSent: { productId: number; lastSentAt: string }[];

  @Column
  lgpdSendMessageAt: Date;

  @Column
  lgpdAcceptedAt: Date;

  @Column
  imported: Date;

  @Default(false)
  @Column
  isOutOfHour: boolean;

  @Default(false)
  @Column
  useIntegration: boolean;

  @ForeignKey(() => QueueIntegrations)
  @Column
  integrationId: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegration: QueueIntegrations;

  @ForeignKey(() => CrmLead)
  @Column({ field: "crm_lead_id" })
  crmLeadId: number;

  @BelongsTo(() => CrmLead)
  crmLead: CrmLead;

  @ForeignKey(() => CrmClient)
  @Column({ field: "crm_client_id" })
  crmClientId: number;

  @BelongsTo(() => CrmClient)
  crmClient: CrmClient;

  @Column
  isActiveDemand: boolean;

  @Column
  typebotSessionId: string;

  @Default(false)
  @Column
  typebotStatus: boolean

  @Column
  typebotSessionTime: Date
}

export default Ticket;
