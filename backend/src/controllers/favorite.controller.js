import User from "../models/User.js";
import Listing from "../models/Listing.js";

// Add to favorites
export const addFavorite = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const user = await User.findById(req.user.id);

    if (user.favorites.includes(listingId)) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    user.favorites.push(listingId);
    await user.save();

    res.json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { listingId } = req.params;

    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter((id) => id.toString() !== listingId);
    await user.save();

    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all favorites
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
