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
  HasMany
} from "sequelize-typescript";

import Company from "./Company";
import CrmClient from "./CrmClient";
import Invoice from "./Invoices";
import ProjectService from "./ProjectService";
import ProjectProduct from "./ProjectProduct";
import ProjectUser from "./ProjectUser";
import ProjectTask from "./ProjectTask";

@Table({
  tableName: "projects"
})
class Project extends Model<Project> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => CrmClient)
  @Column
  clientId: number;

  @BelongsTo(() => CrmClient)
  client: CrmClient;

  @ForeignKey(() => Invoice)
  @Column
  invoiceId: number;

  @BelongsTo(() => Invoice)
  invoice: Invoice;

  @Column(DataType.STRING(255))
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.DATE)
  deliveryTime: Date;

  @Column(DataType.TEXT)
  warranty: string;

  @Column(DataType.TEXT)
  terms: string;

  @Default("draft")
  @Column(DataType.STRING(30))
  status: "draft" | "active" | "paused" | "completed" | "cancelled";

  @Column(DataType.DATE)
  startDate: Date;

  @Column(DataType.DATE)
  endDate: Date;

  @HasMany(() => ProjectService)
  services: ProjectService[];

  @HasMany(() => ProjectProduct)
  products: ProjectProduct[];

  @HasMany(() => ProjectUser)
  users: ProjectUser[];

  @HasMany(() => ProjectTask)
  tasks: ProjectTask[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Project;
