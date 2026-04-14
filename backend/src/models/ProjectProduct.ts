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
import Produto from "./Produto";

@Table({
  tableName: "project_products"
})
class ProjectProduct extends Model<ProjectProduct> {
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

  @ForeignKey(() => Produto)
  @Column
  productId: number;

  @BelongsTo(() => Produto)
  product: Produto;

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

export default ProjectProduct;
