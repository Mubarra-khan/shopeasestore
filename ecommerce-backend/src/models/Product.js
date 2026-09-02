const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
	price: {
		type: Number,
		required: true,
		min: 0,
	},
	originalPrice: {
		type: Number,
		min: 0,
		default: null,
	},
		image: {
			type: String,
			required: true,
			trim: true,
		},
		images: {
			type: [String],
			default: [],
		},
		descriptionImages: {
			type: [String],
			default: [],
		},
		productVideos: {
			type: [String],
			default: [],
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		stock: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
		categoryRef: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			default: null,
		},
		subcategoryRef: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Subcategory",
			default: null,
		},
		childSubcategoryRef: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Subcategory",
			default: null,
		},
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		brand: { type: String, default: '' },
		color: { type: String, default: '' },
		material: { type: String, default: '' },
		age: { type: String, default: '' },
		service: { type: String, default: '' },
		promotion: { type: String, default: '' },
		deliveryFrom: { type: String, default: '' },
		warrantyType: { type: String, default: '' },
		warrantyPeriod: { type: String, default: '' },
		storageRequirement: { type: String, default: '' },
		isForSale: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

productSchema.index({ categoryRef: 1, subcategoryRef: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ name: "text", description: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
