import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";
import { RtcTokenBuilder, RtcRole } from "agora-token";
import { config } from "../../../../config/env";

export class AgoraController {
  static getToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { channelName } = req.body;

      if (!channelName) {
        return next(new AppError("channelName is required", 400));
      }

      if (!config.AGORA_APP_CERTIFICATE) {
        return next(
          new AppError(
            "Agora App Certificate is not configured. Set AGORA_APP_CERTIFICATE in .env",
            500,
          ),
        );
      }

      const uid = 0;
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        config.AGORA_APP_ID,
        config.AGORA_APP_CERTIFICATE,
        channelName,
        uid,
        role,
        expirationTimeInSeconds,
        privilegeExpiredTs,
      );

      res.status(200).json({
        status: "success",
        data: { token, appId: config.AGORA_APP_ID },
      });
    },
  );
}
