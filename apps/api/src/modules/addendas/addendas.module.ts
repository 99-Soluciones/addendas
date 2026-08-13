import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module.js";
import { AddendasController } from "./addendas.controller.js";
import { AddendasService } from "./addendas.service.js";

@Module({
  imports: [NotificationsModule],
  controllers: [AddendasController],
  providers: [AddendasService],
})
export class AddendasModule {}
