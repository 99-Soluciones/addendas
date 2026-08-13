import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

@Module({
  imports: [NotificationsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
