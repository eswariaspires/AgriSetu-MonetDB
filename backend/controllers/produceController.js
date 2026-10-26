import { query } from "../config/query.js";

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 5 * 1024 * 1024;

const validateImages = (images) => {
  if (images === undefined) {
    return { valid: true, images: [] };
  }

  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    return {
      valid: false,
      message: "You can upload up to five photos.",
    };
  }

  let totalBytes = 0;

  for (const image of images) {
    if (typeof image !== "string") {
      return { valid: false, message: "Invalid image data." };
    }

    const match = image.match(
      /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/
    );

    if (!match) {
      return {
        valid: false,
        message: "Use JPG, PNG, or WebP images only.",
      };
    }

    const base64 = match[2];
    const bytes =
      Math.floor((base64.length * 3) / 4) -
      (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);

    if (bytes > MAX_IMAGE_BYTES) {
      return {
        valid: false,
        message: "Each photo must be 1 MB or smaller.",
      };
    }

    totalBytes += bytes;
  }

  if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
    return {
      valid: false,
      message: "The combined size of photos must be 5 MB or smaller.",
    };
  }

  return { valid: true, images };
};

const mapProduce = (row, columns) => {
  if (!row) return null;

  const item = Object.fromEntries(
    columns.map((column, index) => [column, row[index]])
  );

  let images = [];

  try {
    images = item.images ? JSON.parse(item.images) : [];
  } catch {
    images = [];
  }

  return {
    _id: String(item.produce_id),
    farmerId: String(item.farmer_id),
    crop: item.crop,
    quantity: Number(item.quantity),
    unit: item.unit,
    quality: item.quality,
    date: item.harvest_date,
    district: item.district,
    state: item.state,
    description: item.description || "",
    status: item.status || "Available",
    images,
    createdAt: item.created_at,
  };
};

const getProduceById = async (id) => {
  const result = await query(
    `SELECT produce_id, farmer_id, crop, quantity, unit,
            quality, harvest_date, district, state,
            description, status, images, created_at
     FROM agrisetu.produce
     WHERE produce_id = ?`,
    Number(id)
  );

  if (!result.data.length) return null;

  return mapProduce(result.data[0], result.headers.columnNames);
};

export const getProduce = async (req, res) => {
  try {
    const result = await query(
      `SELECT produce_id, farmer_id, crop, quantity, unit,
              quality, harvest_date, district, state,
              description, status, images, created_at
       FROM agrisetu.produce
       ORDER BY created_at DESC`
    );

    const produce = result.data.map((row) =>
      mapProduce(row, result.headers.columnNames)
    );

    return res.json({ produce });
  } catch (error) {
    console.error("Get produce error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch produce listings.",
    });
  }
};

export const createProduce = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can add produce.",
      });
    }

    const {
      crop,
      quantity,
      unit,
      quality,
      date,
      district,
      state,
      description,
      images,
    } = req.body;

    if (
      !crop?.trim() ||
      !(Number(quantity) > 0) ||
      !["kg", "quintal", "ton"].includes(unit) ||
      !date ||
      !district?.trim() ||
      !state?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide valid produce details.",
      });
    }

    if (
      quality !== undefined &&
      !["Grade A", "Grade B", "Grade C", "Not sure"].includes(quality)
    ) {
      return res.status(400).json({
        message: "Please select a valid quality grade.",
      });
    }

    const imageCheck = validateImages(images);

    if (!imageCheck.valid) {
      return res.status(400).json({
        message: imageCheck.message,
      });
    }

    const farmerId = Number(req.user.id);

    if (!Number.isInteger(farmerId) || farmerId <= 0) {
      return res.status(400).json({
        message: "Invalid farmer account ID.",
      });
    }

    await query(
      `INSERT INTO agrisetu.produce
       (farmer_id, crop, quantity, unit, quality, harvest_date,
        district, state, description, status, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      farmerId,
      crop.trim(),
      Number(quantity),
      unit,
      quality || "Not sure",
      date,
      district.trim(),
      state.trim(),
      description || "",
      "Available",
      JSON.stringify(imageCheck.images)
    );

    const result = await query(
      `SELECT produce_id
       FROM agrisetu.produce
       WHERE farmer_id = ?
       ORDER BY produce_id DESC
       LIMIT 1`,
      farmerId
    );

    if (!result.data.length) {
      throw new Error("Produce was inserted but could not be retrieved.");
    }

    const produce = await getProduceById(result.data[0][0]);

    return res.status(201).json({ produce });
  } catch (error) {
    console.error("Create produce error:", error.message);

    return res.status(500).json({
      message: "Unable to add produce.",
    });
  }
};

export const updateProduce = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update produce.",
      });
    }

    const produceId = Number(req.params.id);
    const farmerId = Number(req.user.id);

    if (
      !Number.isInteger(produceId) ||
      produceId <= 0 ||
      !Number.isInteger(farmerId) ||
      farmerId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid produce ID.",
      });
    }

    const existingResult = await query(
      `SELECT produce_id
       FROM agrisetu.produce
       WHERE produce_id = ? AND farmer_id = ?`,
      produceId,
      farmerId
    );

    if (!existingResult.data.length) {
      return res.status(404).json({
        message: "Produce listing not found.",
      });
    }

    const allowedFields = [
      "crop",
      "quantity",
      "unit",
      "quality",
      "date",
      "district",
      "state",
      "description",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.crop !== undefined && !String(updates.crop).trim()) {
      return res.status(400).json({
        message: "Crop name is required.",
      });
    }

    if (
      updates.quantity !== undefined &&
      !(Number(updates.quantity) > 0)
    ) {
      return res.status(400).json({
        message: "Quantity must be greater than zero.",
      });
    }

    if (
      updates.unit !== undefined &&
      !["kg", "quintal", "ton"].includes(updates.unit)
    ) {
      return res.status(400).json({
        message: "Invalid quantity unit.",
      });
    }

    if (
      updates.quality !== undefined &&
      !["Grade A", "Grade B", "Grade C", "Not sure"].includes(
        updates.quality
      )
    ) {
      return res.status(400).json({
        message: "Invalid quality grade.",
      });
    }

    if (
      updates.status !== undefined &&
      !["Available", "Unavailable", "Sold"].includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Invalid produce status.",
      });
    }

    if (updates.crop !== undefined) {
      updates.crop = String(updates.crop).trim();
    }

    if (updates.quantity !== undefined) {
      updates.quantity = Number(updates.quantity);
    }

    if (updates.district !== undefined) {
      updates.district = String(updates.district).trim();
    }

    if (updates.state !== undefined) {
      updates.state = String(updates.state).trim();
    }

    if (updates.date !== undefined) {
      updates.harvest_date = updates.date;
      delete updates.date;
    }

    if (req.body.images !== undefined) {
      const imageCheck = validateImages(req.body.images);

      if (!imageCheck.valid) {
        return res.status(400).json({
          message: imageCheck.message,
        });
      }

      updates.images = JSON.stringify(imageCheck.images);
    }

    const columnMap = {
      crop: "crop",
      quantity: "quantity",
      unit: "unit",
      quality: "quality",
      harvest_date: "harvest_date",
      district: "district",
      state: "state",
      description: "description",
      status: "status",
      images: "images",
    };

    const entries = Object.entries(updates).filter(
      ([field]) => columnMap[field]
    );

    if (entries.length > 0) {
      const setClause = entries
        .map(([field]) => `${columnMap[field]} = ?`)
        .join(", ");

      const values = entries.map(([, value]) => value);

      await query(
        `UPDATE agrisetu.produce
         SET ${setClause}
         WHERE produce_id = ? AND farmer_id = ?`,
        ...values,
        produceId,
        farmerId
      );
    }

    const produce = await getProduceById(produceId);

    return res.json({ produce });
  } catch (error) {
    console.error("Update produce error:", error.message);

    return res.status(500).json({
      message: "Unable to update produce.",
    });
  }
};

export const deleteProduce = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can delete produce.",
      });
    }

    const produceId = Number(req.params.id);
    const farmerId = Number(req.user.id);

    if (
      !Number.isInteger(produceId) ||
      produceId <= 0 ||
      !Number.isInteger(farmerId) ||
      farmerId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid produce ID.",
      });
    }

    const existingResult = await query(
      `SELECT produce_id
       FROM agrisetu.produce
       WHERE produce_id = ? AND farmer_id = ?`,
      produceId,
      farmerId
    );

    if (!existingResult.data.length) {
      return res.status(404).json({
        message: "Produce listing not found.",
      });
    }

    await query(
      `DELETE FROM agrisetu.produce
       WHERE produce_id = ? AND farmer_id = ?`,
      produceId,
      farmerId
    );

    return res.json({
      message: "Produce deleted successfully.",
    });
  } catch (error) {
    console.error("Delete produce error:", error.message);

    return res.status(500).json({
      message: "Unable to delete produce.",
    });
  }
};