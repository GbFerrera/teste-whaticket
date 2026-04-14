import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  BelongsTo,
  BeforeDestroy
} from "sequelize-typescript";
import Tag from "./Tag";
import Ticket from "./Ticket";

@Table({
  tableName: 'TicketTags'
})
class TicketTag extends Model<TicketTag> {
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @BelongsTo(() => Tag)
  tag: Tag;

  // KANBAN FIX: Bloquear remoção de tags de tickets encerrados
  @BeforeDestroy
  static async preventDeleteOnClosedTickets(instance: TicketTag) {
    const ticket = await Ticket.findByPk(instance.ticketId);
    if (ticket && ticket.status === "closed") {
      console.log(`🔴 KANBAN FIX: Bloqueando remoção de tag ${instance.tagId} do ticket ${instance.ticketId} - ticket está encerrado`);
      throw new Error("Não é permitido remover tags de tickets encerrados");
    }
  }
}

export default TicketTag;
