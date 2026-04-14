import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Default
} from "sequelize-typescript";

@Table
class Coupon extends Model<Coupon> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column({ unique: true })
  code: string;

  @Default("percentage")
  @Column(DataType.ENUM("percentage", "fixed"))
  discountType: string;

  @Column(DataType.DECIMAL(10, 2))
  discountValue: number;

  @Column(DataType.DECIMAL(10, 2))
  minPlanAmount: number; // Valor mínimo do plano para aplicar o cupom

  @Column
  maxUses: number; // Número máximo de usos (null = ilimitado)

  @Default(0)
  @Column
  usedCount: number;

  @Column
  validUntil: Date;

  @Default(true)
  @Column
  isActive: boolean;

  @Column(DataType.TEXT)
  description?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Coupon;
