import {
  Table,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  DataType,
  Default,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";

@Table
class AffiliateWithdrawal extends Model<AffiliateWithdrawal> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  affiliateId: number;

  @Column(DataType.DECIMAL(10, 2))
  amount: number;

  @Default("pending")
  @Column(DataType.ENUM("pending", "approved", "rejected"))
  status: string;

  @Column
  paymentMethod: string; // PIX, transferência, etc.

  @Column(DataType.JSON)
  paymentDetails: any; // Dados do pagamento (chave PIX, banco, etc.)

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.TEXT)
  rejectionReason?: string;

  @CreatedAt
  createdAt: Date;

  @Column
  processedAt?: Date;

  @ForeignKey(() => User)
  @Column
  processedBy?: number; // ID do usuário que aprovou/rejeitou

  @BelongsTo(() => User, { foreignKey: "processedBy" })
  processor: User;
}

export default AffiliateWithdrawal;
