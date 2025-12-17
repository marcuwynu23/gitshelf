import {Response} from "express";
import {AuthRequest} from "../middleware/auth";
import {SettingsService} from "../services/SettingsService";
import {UpdateSettingsRequest} from "../models/Settings";

const settingsService = new SettingsService();

export class SettingsController {
  async getSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const settings = await settingsService.getByUserId(req.userId);
      res.json(settings);
    } catch (err) {
      console.error("GET /api/settings error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const updates: UpdateSettingsRequest = req.body;

      // Validate updates
      if (updates.general) {
        if (
          updates.general.language &&
          !["en", "es", "fr", "de"].includes(updates.general.language)
        ) {
          res.status(400).json({error: "Invalid language"});
          return;
        }

        if (
          updates.general.dateFormat &&
          !["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].includes(
            updates.general.dateFormat
          )
        ) {
          res.status(400).json({error: "Invalid date format"});
          return;
        }
      }

      if (updates.security) {
        if (
          updates.security.sessionTimeout &&
          !["15", "30", "60", "120", "0"].includes(
            updates.security.sessionTimeout
          )
        ) {
          res.status(400).json({error: "Invalid session timeout"});
          return;
        }
      }

      const updatedSettings = await settingsService.update(req.userId, updates);
      res.json(updatedSettings);
    } catch (err: any) {
      console.error("PUT /api/settings error:", err);
      if (err.message) {
        res.status(400).json({error: err.message});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }
}

