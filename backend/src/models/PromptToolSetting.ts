import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Company from "./Company";
import Prompt from "./Prompt";

@Table
class PromptToolSetting extends Model<PromptToolSetting> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Prompt)
  @AllowNull(true)
  @Column
  promptId: number | null;

  @BelongsTo(() => Prompt)
  prompt: Prompt;

  @AllowNull(false)
  @Column
  toolName: string;

  @AllowNull(false)
  @Column({ defaultValue: false })
  enabled: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default PromptToolSetting;
