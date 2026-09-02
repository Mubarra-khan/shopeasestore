require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product");
const Order = require("../src/models/Order");

async function main() {
  const response = await fetch("http://localhost:5000/api/products");
  const payload = await response.json();
  const products = payload.data || [];
  const seeded = products.filter((product) =>
    ["Laptops", "Smartphones", "Accessories"].includes(product.category) &&
    product.image.includes("images.unsplash.com")
  );
  const imageUrls = [...new Set(seeded.map((product) => product.image))];
  const imageResults = await Promise.all(
    imageUrls.map(async (url) => {
      try {
        const imageResponse = await fetch(url);
        return {
          url,
          usable: imageResponse.ok && imageResponse.headers.get("content-type")?.startsWith("image/"),
        };
      } catch {
        return { url, usable: false };
      }
    })
  );

  await mongoose.connect(process.env.MONGO_URI);
  const security = await Product.findById("6a85e788028e828e9c83706d").select(
    "name price category stock image"
  );
  const orderCount = await Order.countDocuments();
  await mongoose.disconnect();

  console.log(JSON.stringify({
    apiStatus: response.status,
    apiProductCount: products.length,
    seededProductCount: seeded.length,
    categoryCounts: seeded.reduce((counts, product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
      return counts;
    }, {}),
    allApiImagesPresent: products.every((product) => Boolean(product.image)),
    imageUrlsChecked: imageUrls.length,
    imagesReachable: imageResults.every((result) => result.usable),
    failedImageUrls: imageResults.filter((result) => !result.usable).map((result) => result.url),
    security,
    orderCount,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});