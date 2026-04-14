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
  Default
} from "sequelize-typescript";

import Company from "./Company";
import Project from "./Project";
import Servico from "./Servico";

@Table({
  tableName: "project_services"
})
class ProjectService extends Model<ProjectService> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Project)
  @Column
  projectId: number;

  @BelongsTo(() => Project)
  project: Project;

  @ForeignKey(() => Servico)
  @Column
  serviceId: number;

  @BelongsTo(() => Servico)
  service: Servico;

  @Default(1)
  @Column(DataType.DECIMAL(10, 2))
  quantity: number;

  @Column(DataType.DECIMAL(12, 2))
  unitPrice: number;

  @Column(DataType.TEXT)
  notes: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ProjectService;
