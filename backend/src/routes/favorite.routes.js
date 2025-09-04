import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../controllers/favorite.controller.js";

const router = express.Router();

// Buyers, sellers & admins can manage favorites
router.post("/:listingId", protect, authorize("buyer", "seller", "admin"), addFavorite);
router.delete(
  "/:listingId",
  protect,
  authorize("buyer", "seller", "admin"),
  removeFavorite
);
router.get("/", protect, authorize("buyer", "seller", "admin"), getFavorites);

export default router;
