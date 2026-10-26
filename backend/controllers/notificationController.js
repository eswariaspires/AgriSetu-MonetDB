
import { query } from "../config/query.js";

const isValidId = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;

const getRows = (result) => {
  const columns = result.headers?.columnNames || [];
  const rows = result.data || [];

  return rows.map((row) =>
    Object.fromEntries(columns.map((column, index) => [column, row[index]]))
  );
};

const getValue = (row, name) => {
  if (row[name] !== undefined) return row[name];

  const actualKey = Object.keys(row).find(
    (key) => key.toLowerCase() === name.toLowerCase()
  );

  return actualKey === undefined ? undefined : row[actualKey];
};

const mapNotification = (row) => ({
  _id: String(getValue(row, "notification_id")),
  id: String(getValue(row, "notification_id")),
  recipientId: String(getValue(row, "recipient_id")),
  connectionId: String(getValue(row, "connection_id")),
  type: getValue(row, "type"),
  title: getValue(row, "title"),
  message: getValue(row, "message"),
  isRead: getValue(row, "is_read"),
  createdAt: getValue(row, "created_at"),
});

export const getMyNotifications = async (req, res) => {
  try {
    if (!isValidId(req.user.id)) {
      return res.status(401).json({
        message: "Invalid user ID.",
      });
    }

    const result = await query(
      `SELECT notification_id, recipient_id, connection_id,
              type, title, message, is_read, created_at
       FROM agrisetu.notifications
       WHERE recipient_id = ? AND is_read = FALSE
       ORDER BY created_at DESC`,
      Number(req.user.id)
    );

    const notifications = getRows(result).map(mapNotification);

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch notifications.",
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const recipientId = req.user.id;

    if (!isValidId(notificationId) || !isValidId(recipientId)) {
      return res.status(400).json({
        message: "Invalid notification or user ID.",
      });
    }

    const existingResult = await query(
      `SELECT notification_id
       FROM agrisetu.notifications
       WHERE notification_id = ?
         AND recipient_id = ?
         AND is_read = FALSE`,
      Number(notificationId),
      Number(recipientId)
    );

    if (getRows(existingResult).length === 0) {
      return res.status(404).json({
        message: "Notification not found or already read.",
      });
    }

    await query(
      `UPDATE agrisetu.notifications
       SET is_read = TRUE
       WHERE notification_id = ?
         AND recipient_id = ?
         AND is_read = FALSE`,
      Number(notificationId),
      Number(recipientId)
    );

    const updatedResult = await query(
      `SELECT notification_id, recipient_id, connection_id,
              type, title, message, is_read, created_at
       FROM agrisetu.notifications
       WHERE notification_id = ? AND recipient_id = ?`,
      Number(notificationId),
      Number(recipientId)
    );

    const rows = getRows(updatedResult);

    return res.status(200).json({
      message: "Notification marked as read.",
      notification: rows.length > 0 ? mapNotification(rows[0]) : null,
    });
  } catch (error) {
    console.error("Mark notification read error:", error.message);

    return res.status(500).json({
      message: "Unable to update notification.",
    });
  }
};
