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
  HasMany,
  BelongsToMany
} from "sequelize-typescript";

import Company from "./Company";
import Project from "./Project";
import User from "./User";
import ProjectTaskUser from "./ProjectTaskUser";

@Table({
  tableName: "project_tasks"
})
class ProjectTask extends Model<ProjectTask> {
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

  @Column(DataType.STRING(255))
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @Default("pending")
  @Column(DataType.STRING(30))
  status: "pending" | "in_progress" | "review" | "completed" | "cancelled";

  @Default(0)
  @Column(DataType.INTEGER)
  order: number;

  @Column(DataType.DATE)
  startDate: Date;

  @Column(DataType.DATE)
  dueDate: Date;

  @Column(DataType.DATE)
  completedAt: Date;

  @HasMany(() => ProjectTaskUser)
  taskUsers: ProjectTaskUser[];

  @BelongsToMany(() => User, () => ProjectTaskUser)
  assignedUsers: User[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ProjectTask;
