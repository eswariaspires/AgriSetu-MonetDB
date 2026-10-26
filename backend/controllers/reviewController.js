import { query } from "../config/query.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const isValidId = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;

const isValidRating = (value) =>
  Number.isInteger(value) && value >= 1 && value <= 5;

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

const mapReview = (row) => ({
  _id: String(getValue(row, "review_id")),
  id: String(getValue(row, "review_id")),
  connectionId: String(getValue(row, "connection_id")),
  buyerId: String(getValue(row, "buyer_id")),
  farmerId: String(getValue(row, "farmer_id")),
  produceId: String(getValue(row, "produce_id")),
  qualityRating: Number(getValue(row, "quality_rating")),
  serviceRating: Number(getValue(row, "service_rating")),
  overallRating: Number(getValue(row, "overall_rating")),
  comment: getValue(row, "comment") || "",
  createdAt: getValue(row, "created_at"),
});

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const buyerId = getUserId(req);

    if (!isValidId(buyerId)) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (req.user.role !== "buyer") {
      return res.status(403).json({
        message: "Only buyers can submit reviews.",
      });
    }

    const {
      connectionId,
      qualityRating,
      serviceRating,
      overallRating,
      comment = "",
    } = req.body;

    if (!isValidId(connectionId)) {
      return res.status(400).json({
        message: "Invalid connection ID.",
      });
    }

    if (
      !isValidRating(qualityRating) ||
      !isValidRating(serviceRating) ||
      !isValidRating(overallRating)
    ) {
      return res.status(400).json({
        message: "All ratings must be whole numbers from 1 to 5.",
      });
    }

    if (typeof comment !== "string" || comment.length > 1000) {
      return res.status(400).json({
        message: "Comment must be 1000 characters or fewer.",
      });
    }

    const connectionResult = await query(
      `SELECT connection_id, buyer_id, farmer_id, produce_id, status
       FROM agrisetu.connections
       WHERE connection_id = ? AND buyer_id = ? AND status = ?`,
      Number(connectionId),
      Number(buyerId),
      "accepted"
    );

    const connections = getRows(connectionResult);

    if (connections.length === 0) {
      return res.status(403).json({
        message: "You can review only a produce connection accepted by you.",
      });
    }

    const connection = connections[0];

    const existingResult = await query(
      `SELECT review_id
       FROM agrisetu.reviews
       WHERE connection_id = ?`,
      Number(connectionId)
    );

    if (getRows(existingResult).length > 0) {
      return res.status(409).json({
        message: "You have already reviewed this connection.",
      });
    }

    await query(
      `INSERT INTO agrisetu.reviews
        (connection_id, buyer_id, farmer_id, produce_id,
         quality_rating, service_rating, overall_rating, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      Number(connectionId),
      Number(buyerId),
      Number(getValue(connection, "farmer_id")),
      Number(getValue(connection, "produce_id")),
      qualityRating,
      serviceRating,
      overallRating,
      comment.trim()
    );

    const insertedResult = await query(
      `SELECT review_id, connection_id, buyer_id, farmer_id, produce_id,
              quality_rating, service_rating, overall_rating, comment, created_at
       FROM agrisetu.reviews
       WHERE connection_id = ?
       ORDER BY review_id DESC
       LIMIT 1`,
      Number(connectionId)
    );

    const insertedRows = getRows(insertedResult);

    if (insertedRows.length === 0) {
      return res.status(500).json({
        message: "Review was not found after insertion.",
      });
    }

    return res.status(201).json({
      message: "Review published successfully.",
      review: mapReview(insertedRows[0]),
    });
  } catch (error) {
    console.error("Create review error:", error.message);

    return res.status(500).json({
      message: "Unable to submit review.",
    });
  }
};

// GET /api/reviews/farmer/:farmerId
export const getFarmerReviews = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!isValidId(farmerId)) {
      return res.status(400).json({
        message: "Invalid farmer ID.",
      });
    }

    const result = await query(
      `SELECT r.review_id, r.connection_id, r.buyer_id, r.farmer_id,
              r.produce_id, r.quality_rating, r.service_rating,
              r.overall_rating, r.comment, r.created_at,
              u.name AS buyer_name
       FROM agrisetu.reviews r
       LEFT JOIN agrisetu.users u ON u.user_id = r.buyer_id
       WHERE r.farmer_id = ?
       ORDER BY r.created_at DESC`,
      Number(farmerId)
    );

    const rows = getRows(result);
    const reviews = rows.map((row) => ({
      ...mapReview(row),
      buyerName: getValue(row, "buyer_name") || "Buyer",
    }));

    const reviewCount = reviews.length;

    const averageRating = reviewCount
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.overallRating, 0) /
            reviewCount
          ).toFixed(1)
        )
      : 0;

    return res.status(200).json({
      averageRating,
      reviewCount,
      reviews,
    });
  } catch (error) {
    console.error("Get farmer reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to load reviews.",
    });
  }
};

// GET /api/reviews/produce/:produceId
export const getProduceReviews = async (req, res) => {
  try {
    const { produceId } = req.params;

    if (!isValidId(produceId)) {
      return res.status(400).json({
        message: "Invalid produce ID.",
      });
    }

    const result = await query(
      `SELECT r.review_id, r.connection_id, r.buyer_id, r.farmer_id,
              r.produce_id, r.quality_rating, r.service_rating,
              r.overall_rating, r.comment, r.created_at,
              u.name AS buyer_name
       FROM agrisetu.reviews r
       LEFT JOIN agrisetu.users u ON u.user_id = r.buyer_id
       WHERE r.produce_id = ?
       ORDER BY r.created_at DESC`,
      Number(produceId)
    );

    const reviews = getRows(result).map((row) => ({
      ...mapReview(row),
      buyerName: getValue(row, "buyer_name") || "Buyer",
    }));

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get produce reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to load reviews.",
    });
  }
};

// GET /api/reviews/mine
export const getMyReviews = async (req, res) => {
  try {
    const buyerId = getUserId(req);

    if (!isValidId(buyerId)) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const result = await query(
      `SELECT review_id, connection_id, buyer_id, farmer_id, produce_id,
              quality_rating, service_rating, overall_rating, comment, created_at
       FROM agrisetu.reviews
       WHERE buyer_id = ?
       ORDER BY created_at DESC`,
      Number(buyerId)
    );

    const reviews = getRows(result).map(mapReview);

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get my reviews error:", error.message);

    return res.status(500).json({
      message: "Unable to load your reviews.",
    });
  }
};
