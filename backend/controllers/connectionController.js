
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

const getValue = (row, ...names) => {
  for (const name of names) {
    if (row[name] !== undefined) return row[name];

    const actualKey = Object.keys(row).find(
      (key) => key.toLowerCase() === name.toLowerCase()
    );

    if (actualKey !== undefined) return row[actualKey];
  }

  return undefined;
};

const mapConnection = (row) => ({
  id: String(getValue(row, "connection_id")),
  _id: String(getValue(row, "connection_id")),
  buyerId: String(getValue(row, "buyer_id")),
  farmerId: String(getValue(row, "farmer_id")),
  produceId: String(getValue(row, "produce_id")),
  status: getValue(row, "status"),
  createdAt: getValue(row, "created_at"),
  updatedAt: getValue(row, "updated_at"),
  respondedAt: getValue(row, "responded_at") ?? null,
});

const createNotification = async ({
  recipientId,
  connectionId,
  type,
  title,
  message,
}) => {
  await query(
    `INSERT INTO agrisetu.notifications
      (recipient_id, connection_id, type, title, message, is_read)
     VALUES (?, ?, ?, ?, ?, FALSE)`,
    Number(recipientId),
    Number(connectionId),
    type,
    title,
    message
  );
};

export const createConnection = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({
        message: "Only buyers can send requests.",
      });
    }

    const { farmerId, produceId } = req.body;
    const buyerId = req.user.id;

    if (
      !isValidId(buyerId) ||
      !isValidId(farmerId) ||
      !isValidId(produceId)
    ) {
      return res.status(400).json({
        message: "Valid buyer, farmer, and produce IDs are required.",
      });
    }

    const farmerResult = await query(
      `SELECT user_id, name
       FROM agrisetu.users
       WHERE user_id = ? AND role = ?`,
      Number(farmerId),
      "farmer"
    );

    if (getRows(farmerResult).length === 0) {
      return res.status(404).json({
        message: "Farmer not found.",
      });
    }

    const produceResult = await query(
      `SELECT produce_id
       FROM agrisetu.produce
       WHERE produce_id = ? AND farmer_id = ?`,
      Number(produceId),
      Number(farmerId)
    );

    if (getRows(produceResult).length === 0) {
      return res.status(404).json({
        message: "Produce not found for this farmer.",
      });
    }

    await query(
      `INSERT INTO agrisetu.connections
        (buyer_id, farmer_id, produce_id, status)
       VALUES (?, ?, ?, ?)`,
      Number(buyerId),
      Number(farmerId),
      Number(produceId),
      "pending"
    );

    const insertedResult = await query(
      `SELECT connection_id, buyer_id, farmer_id, produce_id,
              status, created_at, updated_at
       FROM agrisetu.connections
       WHERE buyer_id = ? AND farmer_id = ? AND produce_id = ?
       ORDER BY connection_id DESC
       LIMIT 1`,
      Number(buyerId),
      Number(farmerId),
      Number(produceId)
    );

    const insertedRows = getRows(insertedResult);

    if (insertedRows.length === 0) {
      return res.status(500).json({
        message: "Connection was not found after insertion.",
      });
    }

    const connection = mapConnection(insertedRows[0]);

    await createNotification({
      recipientId: farmerId,
      connectionId: connection.id,
      type: "request",
      title: "New connection request",
      message: "A buyer has requested produce from your listing.",
    });

    return res.status(201).json({
      message: "Connection request sent successfully.",
      connection,
    });
  } catch (error) {
    console.error("Create connection error:", error.message);

    return res.status(500).json({
      message: "Unable to create connection.",
    });
  }
};

export const getConnections = async (req, res) => {
  try {
    const result = await query(
      `SELECT connection_id, buyer_id, farmer_id, produce_id,
              status, created_at, updated_at
       FROM agrisetu.connections
       ORDER BY updated_at DESC`
    );

    const connections = getRows(result).map(mapConnection);

    return res.status(200).json({ connections });
  } catch (error) {
    console.error("Fetch connections error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch connections.",
    });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const isBuyer = req.user.role === "buyer";

    if (!isValidId(userId)) {
      return res.status(401).json({
        message: "Invalid user ID.",
      });
    }

    const filterColumn = isBuyer ? "buyer_id" : "farmer_id";

    const result = await query(
      `SELECT
          c.connection_id,
          c.buyer_id,
          c.farmer_id,
          c.produce_id,
          c.status,
          c.created_at,
          c.updated_at,
          b.name AS buyer_name,
          f.name AS farmer_name
       FROM agrisetu.connections c
       LEFT JOIN agrisetu.users b ON b.user_id = c.buyer_id
       LEFT JOIN agrisetu.users f ON f.user_id = c.farmer_id
       WHERE c.${filterColumn} = ?
       ORDER BY c.updated_at DESC`,
      Number(userId)
    );

    const connections = await Promise.all(
      getRows(result).map(async (row) => {
        const connection = mapConnection(row);
        const otherUserId = isBuyer
          ? connection.farmerId
          : connection.buyerId;

        const canSeeContact = !isBuyer || connection.status === "accepted";
        let contact = null;

        if (canSeeContact) {
          const contactResult = await query(
            `SELECT user_id, name, email, phone, district, state
             FROM agrisetu.users
             WHERE user_id = ?`,
            Number(otherUserId)
          );

          const contactRows = getRows(contactResult);

          if (contactRows.length > 0) {
            const person = contactRows[0];

            contact = {
              _id: String(getValue(person, "user_id")),
              id: String(getValue(person, "user_id")),
              name: getValue(person, "name"),
              email: getValue(person, "email"),
              phone: getValue(person, "phone"),
              district: getValue(person, "district"),
              state: getValue(person, "state"),
            };
          }
        }

        return {
          ...connection,
          otherUser: contact,
        };
      })
    );

    return res.status(200).json({ connections });
  } catch (error) {
    console.error("Get connections error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch connections.",
    });
  }
};

export const updateConnectionStatus = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update requests.",
      });
    }

    const farmerId = req.user.id;
    const connectionId = req.params.id;
    const { status } = req.body;

    if (!isValidId(farmerId) || !isValidId(connectionId)) {
      return res.status(400).json({
        message: "Valid farmer and connection IDs are required.",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid connection status.",
      });
    }

    const existingResult = await query(
      `SELECT connection_id, buyer_id, farmer_id, produce_id,
              status, created_at, updated_at
       FROM agrisetu.connections
       WHERE connection_id = ? AND farmer_id = ? AND status = ?`,
      Number(connectionId),
      Number(farmerId),
      "pending"
    );

    const existingRows = getRows(existingResult);

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: "Connection not found or already processed.",
      });
    }

    await query(
      `UPDATE agrisetu.connections
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE connection_id = ? AND farmer_id = ? AND status = ?`,
      status,
      Number(connectionId),
      Number(farmerId),
      "pending"
    );

    const updatedResult = await query(
      `SELECT connection_id, buyer_id, farmer_id, produce_id,
              status, created_at, updated_at
       FROM agrisetu.connections
       WHERE connection_id = ?`,
      Number(connectionId)
    );

    const updatedRows = getRows(updatedResult);

    if (updatedRows.length === 0) {
      return res.status(500).json({
        message: "Unable to retrieve the updated connection.",
      });
    }

    const connection = mapConnection(updatedRows[0]);

    await createNotification({
      recipientId: connection.buyerId,
      connectionId: connection.id,
      type: status,
      title:
        status === "accepted"
          ? "Connection accepted"
          : "Connection rejected",
      message:
        status === "accepted"
          ? "Your connection request has been accepted."
          : "Your connection request has been rejected.",
    });

    return res.status(200).json({
      message: `Request ${status}.`,
      connection,
    });
  } catch (error) {
    console.error("Update connection error:", error.message);

    return res.status(500).json({
      message: "Unable to update request.",
    });
  }
};
