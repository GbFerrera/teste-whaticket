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

@Table
class AffiliateLink extends Model<AffiliateLink> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  affiliateId: number;

  @Column({ unique: true })
  code: string;

  @Column
  url: string;

  @Default(0)
  @Column
  clicks: number;

  @Default(0)
  @Column
  signups: number;

  @Default(0)
  @Column
  conversions: number; // Cadastros que efetivamente pagaram

  @Column(DataType.JSON)
  trackingData: any; // Dados de rastreamento (IP, user agent, etc)

  @CreatedAt
  createdAt: Date;

  // Lazy loading to avoid circular dependency
  public getAffiliate(): Promise<any> {
    const Affiliate = require("./Affiliate").default;
    return Affiliate.findByPk(this.affiliateId);
  }
}

export default AffiliateLink;
