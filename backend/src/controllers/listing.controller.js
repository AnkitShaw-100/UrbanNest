import Listing from "../models/Listing.js";

export const getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user.id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create listing (seller/admin)
export const createListing = async (req, res) => {
  try {
    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }
    // Allow JSON bodies to set images or image URL when no files were uploaded
    if ((!images || images.length === 0) && req.body) {
      if (Array.isArray(req.body.images) && req.body.images.length > 0) {
        images = req.body.images;
      } else if (typeof req.body.image === 'string' && req.body.image.trim().length > 0) {
        images = [req.body.image.trim()];
      }
    }

    // Coerce numeric fields
    const body = { ...req.body };
    if (body.bedrooms !== undefined) body.bedrooms = Number(body.bedrooms);
    if (body.bathrooms !== undefined) body.bathrooms = Number(body.bathrooms);
    if (body.area !== undefined) body.area = Number(body.area);
    if (body.price !== undefined) body.price = Number(body.price);

    const listing = await Listing.create({
      ...body,
      owner: req.user.id,
      images,
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc Get single listing
export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("owner", "name email");
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update listing (owner/admin only)
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Ownership check: only owner or admin
    if (listing.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }

    Object.assign(listing, req.body);
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete listing (owner/admin only)
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Ownership check
    if (listing.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all listings (with search & filters)
export const getListings = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, bedrooms, bathrooms, propertyType, location, status, sort, page, limit } = req.query;

    const filter = {};

    // Search keyword
    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Bedrooms & Bathrooms
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    // Property Type
    if (propertyType) filter.propertyType = propertyType;

    // Location
    if (location) filter.location = { $regex: location, $options: "i" };

    // Status
    if (status) filter.status = status;

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest first
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find(filter)
      .populate("owner", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Listing.countDocuments(filter);

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      listings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

