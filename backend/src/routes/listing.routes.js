import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import upload from "../middleware/upload.js";
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getUserListings,
} from "../controllers/listing.controller.js";

const router = express.Router();
// Private: Get all listings for the logged-in user
router.get("/my-listings", protect, getUserListings);

// Public: Anyone can view listings
router.get("/", getListings);
router.get("/:id", getListing);

// Private: Sellers & Admins can create listings (with image upload)
router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5), // up to 5 images
  createListing
);

// Private: Only listing owner (seller) or admin can update/delete
router.put("/:id", protect, authorize("seller", "admin"), updateListing);
router.delete("/:id", protect, authorize("seller", "admin"), deleteListing);

export default router;
