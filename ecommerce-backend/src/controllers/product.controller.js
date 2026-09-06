const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Return = require("../models/Return");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Review = require("../models/Review");

const isSafeImageUrl = (value) => {
	try {
		const url = new URL(value);
		return ["http:", "https:"].includes(url.protocol);
	} catch {
		return false;
	}
};

const getSellerId = (sellerRef) => {
  if (!sellerRef) return null;
  if (typeof sellerRef === "object") {
    return sellerRef._id ? sellerRef._id.toString() : sellerRef.toString();
  }
  return sellerRef.toString();
};

const buildProductQuery = async (req) => {
  const query = {};
  const {
    search,
    category,
    subcategory,
    childSubcategory,
    seller,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort,
    page = "1",
    limit = req.query.limit,
    brand,
    color,
    material,
    age,
    warrantyType,
    warrantyPeriod,
    deliveryFrom,
    storageRequirement,
  } = req.query;

  if (search && String(search).trim()) {
    const term = String(search).trim();
    query.$or = [
      { name: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
    ];
  }

  if (category) {
    query.$or = query.$or || [];
    const categoryId = String(category).trim();
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      query.$or.push({ categoryRef: categoryId });
      const categoryDoc = await Category.findById(categoryId).select('name').lean();
      if (categoryDoc?.name) {
        query.$or.push({ category: categoryDoc.name });
      }
    }
  }

  if (subcategory) {
    const subcategoryId = String(subcategory).trim();
    if (mongoose.Types.ObjectId.isValid(subcategoryId)) {
      query.subcategoryRef = subcategoryId;
    }
  }

  if (childSubcategory) {
    const childSubcategoryId = String(childSubcategory).trim();
    if (mongoose.Types.ObjectId.isValid(childSubcategoryId)) {
      query.childSubcategoryRef = childSubcategoryId;
    }
  }

  if (seller) {
    const sellerId = String(seller).trim();
    if (mongoose.Types.ObjectId.isValid(sellerId)) {
      query.seller = sellerId;
    }
  }

  if (brand) query.brand = String(brand).trim();
  if (color) query.color = String(color).trim();
  if (material) query.material = String(material).trim();
  if (age) query.age = String(age).trim();
  if (warrantyType) query.warrantyType = String(warrantyType).trim();
  if (warrantyPeriod) query.warrantyPeriod = String(warrantyPeriod).trim();
  if (deliveryFrom) query.deliveryFrom = String(deliveryFrom).trim();
  if (storageRequirement) query.storageRequirement = String(storageRequirement).trim();

  if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      const min = Number(minPrice);
      if (!Number.isNaN(min) && min >= 0) query.price.$gte = min;
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const max = Number(maxPrice);
      if (!Number.isNaN(max) && max >= 0) query.price.$lte = max;
    }
  }

  if (inStock === "true" || inStock === "1") {
    query.stock = { $gt: 0 };
  }

  if (minRating !== undefined) {
    const min = Number(minRating);
    if (!Number.isNaN(min) && min > 0) {
      const productIds = await Review.aggregate([
        { $group: { _id: "$product", avgRating: { $avg: "$rating" } } },
        { $match: { avgRating: { $gte: min } } },
        { $project: { _id: 1 } },
      ]).then((r) => r.map((x) => x._id));

      query._id = { $in: productIds.length > 0 ? productIds : { $exists: false } };
    }
  }

  return { query, sort: String(sort || "newest"), page: Math.max(1, Number(page) || 1), limit: limit ? Math.min(100, Math.max(1, Number(limit) || 1)) : null };
};

const getFilterOptions = async (req, res) => {
  try {
    const { category, subcategory, childSubcategory, search } = req.query;
    const match = {};

    if (category) {
      if (mongoose.Types.ObjectId.isValid(String(category).trim())) {
        match.categoryRef = String(category).trim();
      }
    }
    if (subcategory) {
      if (mongoose.Types.ObjectId.isValid(String(subcategory).trim())) {
        match.subcategoryRef = String(subcategory).trim();
      }
    }
    if (childSubcategory) {
      if (mongoose.Types.ObjectId.isValid(String(childSubcategory).trim())) {
        match.childSubcategoryRef = String(childSubcategory).trim();
      }
    }
    if (search && String(search).trim()) {
      const term = String(search).trim();
      match.$or = [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
      ];
    }

    const fields = ['brand', 'color', 'material', 'age', 'service', 'promotion', 'deliveryFrom', 'warrantyType', 'warrantyPeriod', 'storageRequirement'];
    const result = {};
    const query = Object.keys(match).length > 0 ? match : {};
    for (const field of fields) {
      const values = await Product.distinct(field, query);
      const cleaned = values.filter((value) => value && String(value).trim()).map((value) => String(value).trim()).sort((a, b) => a.localeCompare(b));
      result[field] = Array.from(new Set(cleaned));
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllProducts = async (req, res) => {
	try {
		const { query, sort, page, limit } = await buildProductQuery(req);

		let sortOption = { createdAt: -1 };
		switch (sort) {
			case "price_asc":
				sortOption = { price: 1 };
				break;
			case "price_desc":
				sortOption = { price: -1 };
				break;
			case "rating":
				sortOption = { createdAt: -1 };
				break;
			case "newest":
			default:
				sortOption = { createdAt: -1 };
				break;
		}

		const total = await Product.countDocuments(query);
		const totalPages = Math.max(1, Math.ceil(total / limit));
		const safePage = Math.min(page, totalPages);
		const skip = (safePage - 1) * limit;

      const products = await Product.find(query)
        .populate("seller", "name email role")
        .sort(sortOption)
        .skip(safePage === safePage ? skip : 0)
        .limit(limit || 0);

      const productIds = products.map((product) => product._id);
      const ratingsMap = {};
      if (productIds.length > 0) {
        const ratings = await Review.aggregate([
          { $match: { product: { $in: productIds } } },
          { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]);
        ratings.forEach((entry) => {
          ratingsMap[entry._id] = { averageRating: entry.avgRating, reviewCount: entry.count };
        });
      }

      const data = products.map((product) => ({
        ...product.toObject(),
        averageRating: ratingsMap[product._id]?.averageRating || 0,
        reviewCount: ratingsMap[product._id]?.reviewCount || 0,
      }));

      return res.status(200).json({
        success: true,
        data,
        page: safePage,
        limit,
        total,
        totalPages,
      });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

const getSellerProducts = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const products = await Product.find({ seller: req.user.userId })
      .populate("seller", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSellerDashboardStats = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sellerProducts = await Product.find({ seller: req.user.userId });
    const sellerProductIds = sellerProducts.map((product) => product._id.toString());

    const totalProducts = sellerProducts.length;
    const inStockProducts = sellerProducts.filter((product) => Number(product.stock) > 0).length;
    const outOfStockProducts = sellerProducts.filter((product) => Number(product.stock) === 0).length;

    const orderDocs = await Order.find({ "items.product": { $in: sellerProductIds } }).sort({ createdAt: -1 });

    const eligibleOrders = orderDocs.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled');

    const totalOrders = eligibleOrders.length;
    const pendingOrders = eligibleOrders.filter((order) => order.status === 'pending').length;
    const processingOrders = eligibleOrders.filter((order) => order.status === 'processing').length;
    const deliveredOrders = eligibleOrders.filter((order) => order.status === 'delivered').length;

    const refundedOrderIds = new Set();
    const returnDocs = await Return.find({ status: 'refunded' }).select('order');
    returnDocs.forEach((r) => refundedOrderIds.add(r.order.toString()));

    const totalRevenue = eligibleOrders
      .filter((order) => !refundedOrderIds.has(order._id.toString()))
      .reduce((sum, order) => {
        const sellerItems = order.items.filter((item) => sellerProductIds.includes(item.product.toString()));
        return sum + sellerItems.reduce((itemSum, item) => itemSum + Number(item.subtotal || 0), 0);
      }, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSellerAnalytics = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sellerProducts = await Product.find({ seller: req.user.userId });
    const sellerProductIds = sellerProducts.map((product) => product._id.toString());

    const orderDocs = await Order.find({ "items.product": { $in: sellerProductIds } }).sort({ createdAt: -1 });

    const returnDocs = await Return.find({ status: 'refunded' }).select('order');
    const refundedOrderIds = new Set(returnDocs.map((r) => r.order.toString()));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthOrders = orderDocs.filter((order) => {
      const created = new Date(order.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    });

    const eligibleCurrentMonthOrders = currentMonthOrders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled' && !refundedOrderIds.has(order._id.toString()));

    const sellerCurrentMonthOrders = eligibleCurrentMonthOrders.map((order) => {
      const sellerItems = order.items.filter((item) => sellerProductIds.includes(item.product.toString()));
      return {
        ...order.toObject(),
        items: sellerItems,
        sellerRevenue: sellerItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
      };
    });

    const currentMonthStats = {
      totalOrders: sellerCurrentMonthOrders.length,
      deliveredOrders: sellerCurrentMonthOrders.filter((order) => order.status === 'delivered').length,
      cancelledOrders: currentMonthOrders.filter((order) => order.status === 'cancelled').length,
      revenue: sellerCurrentMonthOrders.reduce((sum, order) => sum + Number(order.sellerRevenue || 0), 0),
    };

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const monthOrders = orderDocs.filter((order) => {
        const created = new Date(order.createdAt);
        return created.getMonth() === month && created.getFullYear() === year;
      });

      const eligibleMonthOrders = monthOrders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled' && !refundedOrderIds.has(order._id.toString()));

      const sellerMonthOrders = eligibleMonthOrders.map((order) => {
        const sellerItems = order.items.filter((item) => sellerProductIds.includes(item.product.toString()));
        return {
          ...order.toObject(),
          items: sellerItems,
          sellerRevenue: sellerItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
        };
      });

      monthlyTrend.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year,
        totalOrders: sellerMonthOrders.length,
        deliveredOrders: sellerMonthOrders.filter((order) => order.status === 'delivered').length,
        cancelledOrders: monthOrders.filter((order) => order.status === 'cancelled').length,
        revenue: sellerMonthOrders.reduce((sum, order) => sum + Number(order.sellerRevenue || 0), 0),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        currentMonth: currentMonthStats,
        monthlyTrend,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: "Invalid product ID" });
		}

		const product = await Product.findById(id).populate("seller", "name email role");

		if (!product) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		if (req.user && req.user.role === "seller") {
			const sellerId = getSellerId(product.seller);
			if (sellerId !== req.user.userId) {
				return res.status(403).json({
					success: false,
					message: "Forbidden: you do not own this product",
				});
			}
		}

		return res.status(200).json({ success: true, data: product });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

const createProduct = async (req, res) => {
	try {
		if (!req.user || !req.user.userId) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

  const { name, description, price, originalPrice, image, category, stock, categoryRef, descriptionImages, images, brand, color, material, age, service, promotion, deliveryFrom, warrantyType, warrantyPeriod, storageRequirement, productVideos, isForSale } = req.body;

  if (!name || !description || price === undefined || !image || !category || stock === undefined) {
		return res.status(400).json({ success: false, message: "All product fields are required" });
	}
	if (!isSafeImageUrl(image)) {
		return res.status(400).json({ success: false, message: "Image must be a valid HTTP or HTTPS URL" });
	}

	const normalizedOriginalPrice = originalPrice !== undefined && originalPrice !== null && Number(originalPrice) > Number(price) ? Number(originalPrice) : null;

  const product = await Product.create({
    name,
    description,
    price,
    image,
    category,
    stock,
    seller: req.user.userId,
    originalPrice: normalizedOriginalPrice,
    categoryRef: categoryRef || null,
    subcategoryRef: req.body.subcategoryRef || null,
    childSubcategoryRef: req.body.childSubcategoryRef || null,
    images: Array.isArray(images) ? images : [],
    descriptionImages: Array.isArray(descriptionImages) ? descriptionImages : [],
    productVideos: Array.isArray(productVideos) ? productVideos : [],
    brand: brand || '',
    color: color || '',
    material: material || '',
    age: age || '',
    service: service || '',
    promotion: promotion || '',
    deliveryFrom: deliveryFrom || '',
    warrantyType: warrantyType || '',
    warrantyPeriod: warrantyPeriod || '',
    storageRequirement: storageRequirement || '',
    isForSale: isForSale !== undefined ? Boolean(isForSale) : true,
  });

		const populated = await product.populate("seller", "name email role");

		return res.status(201).json({ success: true, data: populated });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

const updateProduct = async (req, res) => {
	try {
		if (!req.user || !req.user.userId) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: "Invalid product ID" });
		}

		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		if (product.seller.toString() !== req.user.userId) {
			return res.status(403).json({ success: false, message: "Forbidden: you do not own this product" });
		}

      const { name, description, price, originalPrice, image, category, stock, categoryRef, subcategoryRef, childSubcategoryRef, descriptionImages, images, brand, color, material, age, service, promotion, deliveryFrom, warrantyType, warrantyPeriod, storageRequirement, productVideos, isForSale } = req.body;

      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = price;
      if (originalPrice !== undefined && originalPrice !== null && Number(originalPrice) > Number(product.price)) {
        product.originalPrice = Number(originalPrice);
      } else {
        product.originalPrice = null;
      }
      if (image !== undefined) {
        if (!isSafeImageUrl(image)) {
          return res.status(400).json({ success: false, message: "Image must be a valid HTTP or HTTPS URL" });
        }
        product.image = image;
      }
      if (category !== undefined) product.category = category;
      if (categoryRef !== undefined) product.categoryRef = categoryRef || null;
      if (subcategoryRef !== undefined) product.subcategoryRef = subcategoryRef || null;
      if (childSubcategoryRef !== undefined) product.childSubcategoryRef = childSubcategoryRef || null;
      if (stock !== undefined) product.stock = stock;
      if (images !== undefined) product.images = Array.isArray(images) ? images : [];
      if (descriptionImages !== undefined) product.descriptionImages = Array.isArray(descriptionImages) ? descriptionImages : [];
      if (productVideos !== undefined) product.productVideos = Array.isArray(productVideos) ? productVideos : [];
      if (brand !== undefined) product.brand = brand || '';
      if (color !== undefined) product.color = color || '';
      if (material !== undefined) product.material = material || '';
      if (age !== undefined) product.age = age || '';
      if (service !== undefined) product.service = service || '';
      if (promotion !== undefined) product.promotion = promotion || '';
      if (deliveryFrom !== undefined) product.deliveryFrom = deliveryFrom || '';
      if (warrantyType !== undefined) product.warrantyType = warrantyType || '';
      if (warrantyPeriod !== undefined) product.warrantyPeriod = warrantyPeriod || '';
      if (storageRequirement !== undefined) product.storageRequirement = storageRequirement || '';
      if (isForSale !== undefined) product.isForSale = Boolean(isForSale);

		await product.save();
		const populated = await product.populate("seller", "name email role");

		return res.status(200).json({ success: true, data: populated });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

const uploadProductImage = (req, res) => {
	if (!req.file) {
		return res.status(400).json({ success: false, message: "An image file is required" });
	}

	return res.status(201).json({
		success: true,
		data: { image: `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}` },
	});
};

const uploadProductVideo = (req, res) => {
	if (!req.file) {
		return res.status(400).json({ success: false, message: "A video file is required" });
	}

	return res.status(201).json({
		success: true,
		data: { video: `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}` },
	});
};

const deleteProduct = async (req, res) => {
	try {
		if (!req.user || !req.user.userId) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: "Invalid product ID" });
		}

		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		if (product.seller.toString() !== req.user.userId) {
			return res.status(403).json({ success: false, message: "Forbidden: you do not own this product" });
		}

		await product.deleteOne();

		return res.status(200).json({ success: true, message: "Product deleted successfully" });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
	getAllProducts,
	getSellerProducts,
	getSellerDashboardStats,
	getSellerAnalytics,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	uploadProductImage,
	uploadProductVideo,
	getFilterOptions,
};
