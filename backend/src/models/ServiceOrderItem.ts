import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import ServiceOrder from "./ServiceOrder";
import Produto from "./Produto";
import Servico from "./Servico";

@Table({ tableName: "ServiceOrderItems" })
class ServiceOrderItem extends Model<ServiceOrderItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ServiceOrder)
  @AllowNull(false)
  @Column
  serviceOrderId: number;

  @BelongsTo(() => ServiceOrder)
  order: ServiceOrder;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING(20))
  itemType: "service" | "product";

  @ForeignKey(() => Servico)
  @AllowNull(true)
  @Column
  serviceId: number | null;

  @BelongsTo(() => Servico)
  service: Servico | null;

  @ForeignKey(() => Produto)
  @AllowNull(true)
  @Column
  productId: number | null;

  @BelongsTo(() => Produto)
  product: Produto | null;

  @Column(DataType.STRING(255))
  description: string | null;

  @Default(1)
  @Column(DataType.DECIMAL(10, 2))
  quantity: number;

  @Default(0)
  @Column(DataType.DECIMAL(12, 2))
  unitPrice: number;

  @Default(0)
  @Column(DataType.DECIMAL(12, 2))
  discount: number;

  @Default(0)
  @Column(DataType.DECIMAL(12, 2))
  total: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ServiceOrderItem;
