require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({}).sort({ _id: 1 });
  console.log('Total products:', products.length);

  let updatedCount = 0;
  let unchangedCount = 0;

  for (const product of products) {
    const currentName = product.name || '';
    if (currentName.length > 60) {
      unchangedCount++;
      continue;
    }

    const newName = generateLongName(product);
    if (newName !== currentName) {
      await Product.findByIdAndUpdate(product._id, { name: newName });
      console.log(`Updated: ${product._id} -> ${newName}`);
      updatedCount++;
    } else {
      unchangedCount++;
    }
  }

  console.log('\nSummary:');
  console.log('Updated:', updatedCount);
  console.log('Unchanged:', unchangedCount);
  console.log('Total:', products.length);

  await mongoose.disconnect();
}

function generateLongName(product) {
  const name = product.name || '';
  const brand = product.brand || '';
  const category = product.category || '';
  const material = product.material || '';
  const color = product.color || '';
  const age = product.age || '';
  const lower = name.toLowerCase();

  if (lower.includes('acer swift edge 16')) {
    return 'Acer Swift Edge 16 Ultra Lightweight Laptop OLED Display Fast Processor Portable Design for Professionals';
  }
  if (lower.includes('lenovo thinkpad e14 gen 5')) {
    return 'Lenovo ThinkPad E14 Gen 5 Business Laptop Durable Build Fast Performance Secure Productivity Machine';
  }
  if (lower.includes('asus rog zephyrus g14')) {
    return 'ASUS ROG Zephyrus G14 Gaming Laptop High Refresh Display Powerful GPU Compact Portable Performance';
  }
  if (lower.includes('hp pavilion plus 14')) {
    return 'HP Pavilion Plus 14 Premium Laptop Full HD Display Modern Design Fast Performance for Students and Professionals';
  }
  if (lower.includes('dell inspiron 16 plus')) {
    return 'Dell Inspiron 16 Plus Large Screen Laptop Powerful Processor High Resolution Display Everyday Computing';
  }
  if (lower.includes('apple macbook air m2')) {
    return 'Apple MacBook Air M2 Thin Light Laptop Retina Display Long Battery Life Powerful M2 Chip Performance';
  }
  if (lower.includes('msi creator m16')) {
    return 'MSI Creator M16 Content Creation Laptop Color Accurate Display High Performance for Designers and Creators';
  }
  if (lower.includes('samsung galaxy book4 pro')) {
    return 'Samsung Galaxy Book4 Pro Windows Laptop AMOLED Display Snapdragon Processor Ultra Portable Design';
  }
  if (lower.includes('google pixel 9 pro')) {
    return 'Google Pixel 9 Pro Smartphone Advanced Camera AI Features Pure Android Experience Stunning Display Quality';
  }
  if (lower.includes('samsung galaxy s25')) {
    return 'Samsung Galaxy S25 Smartphone Premium Design Advanced Camera System Fast Processor Sleek Modern Look';
  }
  if (lower.includes('oneplus 13')) {
    return 'OnePlus 13 Flagship Smartphone High Performance Display Ultra Fast Charging Premium Build Quality';
  }
  if (lower.includes('sony xperia 1 vi')) {
    return 'Sony Xperia 1 VI Professional Smartphone 4K Display Camera Technology Powerful Hardware Entertainment Device';
  }
  if (lower.includes('nothing phone 3a pro')) {
    return 'Nothing Phone 3a Pro Unique Design Transparent Back Bright Display Smooth Performance Stylish Smartphone';
  }
  if (lower.includes('motorola edge 50 ultra')) {
    return 'Motorola Edge 50 Ultra Smartphone Curved Display Advanced Camera Ready For Connectivity Modern Design';
  }
  if (lower.includes('xiaomi 14t pro')) {
    return 'Xiaomi 14T Pro Smartphone Leica Camera System Fast Charging Large Display High Performance Mobile Device';
  }
  if (lower.includes('asus zenfone 11 ultra')) {
    return 'ASUS Zenfone 11 Ultra Smartphone High Resolution Display Powerful Performance Compact Premium Mobile Experience';
  }
  if (lower.includes('nokia x30 5g')) {
    return 'Nokia X30 5G Smartphone Sustainable Design Pure Android Software 5G Speed Reliable Daily Use Phone';
  }
  if (lower.includes('logitech mx master 3s')) {
    return 'Logitech MX Master 3S Wireless Mouse Ergonomic Design Silent Clicks 8K DPI Precision for Productivity';
  }
  if (lower.includes('sony wh-1000xm5')) {
    return 'Sony WH-1000XM5 Wireless Headphones Industry Leading Noise Cancellation Comfortable Fit Crystal Clear Sound';
  }
  if (lower.includes('logitech brio 4k')) {
    return 'Logitech Brio 4K Ultra HD Webcam Professional Streaming Quality HDR Recording Perfect for Video Calls';
  }
  if (lower.includes('anker 7-in-1 usb-c hub')) {
    return 'Anker 7-in-1 USB-C Hub Multi Port Adapter High Speed Data Transfer HDMI Output Compact Travel Design';
  }
  if (lower.includes('samsung t7 shield')) {
    return 'Samsung T7 Shield External SSD Rugged Design Fast Read Write Speeds Password Protection Data Security';
  }
  if (lower.includes('ergotron lx monitor arm')) {
    return 'Ergotron LX Monitor Arm Adjustable Height Smooth Movement Cable Management Ergonomic Desk Setup';
  }
  if (lower.includes('dell xps 15 oled')) {
    return 'Dell XPS 15 OLED Laptop Stunning Display Thin Bezel Design Powerful Performance for Creative Professionals';
  }
  if (lower.includes('leptop')) {
    return 'Generic Portable Laptop Compact Design Everyday Performance Reliable Computing for Students and Professionals';
  }
  if (lower.includes('makeup')) {
    return 'Complete Makeup Collection for Face Eyes and Lips Professional Quality Tools for Beauty Enthusiasts';
  }
  if (lower.includes('portable power bank 20000mah')) {
    return 'Portable Power Bank 20000mAh High Capacity Fast Charging Dual Output Compact Travel Friendly Design';
  }
  if (lower.includes('usb-c fast charger 65w')) {
    return 'USB-C Fast Charger 65W High Power Output Compact Wall Plug Compatible with Laptops Phones Tablets';
  }
  if (lower.includes('4k webcam with ring light')) {
    return '4K Webcam with Ring Light Professional Video Quality Built In Illumination Perfect for Streaming Calls';
  }
  if (lower.includes('27-inch ips monitor')) {
    return '27-inch IPS Monitor Wide Viewing Angles Full HD Resolution Modern Design for Work and Entertainment';
  }
  if (lower.includes('portable ssd 1tb')) {
    return 'Portable SSD 1TB High Speed External Storage Shock Resistant Compact Design for Data Backup Transfer';
  }
  if (lower.includes('smart home hub')) {
    return 'Smart Home Hub Central Control Compatible with Multiple Devices Voice Assistant Ready Modern Home Automation';
  }
  if (lower.includes("men's casual shirt")) {
    return `Men's Casual Shirt ${brand} Soft Fabric Modern Fit Breathable Design for Office Events and Daily Wear`;
  }
  if (lower.includes("women's summer dress")) {
    return `Women's Summer Dress Lightweight Flowy Design ${color} Color Perfect for Vacation Beach and Casual Outings`;
  }
  if (lower.includes('cotton t-shirt pack')) {
    return `Cotton T-Shirt Pack ${brand} Multipack Soft Fabric Casual Everyday Wear Essential for Wardrobe`;
  }
  if (lower.includes('winter jacket insulated')) {
    return `Winter Jacket Insulated ${brand} Warmth Retaining Water Resistant Modern Fit for Cold Weather Outdoor Activities`;
  }
  if (lower.includes('silk tie set')) {
    return `Silk Tie Set Premium Quality ${brand} Elegant Design Multiple Patterns Business Formal and Special Events`;
  }
  if (lower.includes('yoga pants high waist')) {
    return `Yoga Pants High Waist ${brand} Stretchable Fabric Flattering Fit Supportive Design for Yoga Gym Active Lifestyle`;
  }
  if (lower.includes('face moisturizer spf 50')) {
    return 'Face Moisturizer SPF 50 Broad Spectrum Protection Lightweight Formula Hydrating Daily Skincare Essential';
  }
  if (lower.includes('organic hair oil')) {
    return 'Organic Hair Oil Natural Ingredients Nourishing Formula for Stronger Shinier Hair Scalp Care Treatment';
  }
  if (lower.includes('electric toothbrush')) {
    return 'Electric Toothbrush Rechargeable Sonic Technology Multiple Modes Gum Care Whitening and Daily Cleaning';
  }
  if (lower.includes("men's beard trimmer")) {
    return `Men's Beard Trimmer ${brand} Precision Blades Rechargeable Adjustable Length Grooming Tool for Face`;
  }
  if (lower.includes('makeup brush set')) {
    return `Makeup Brush Set ${brand} Soft Synthetic Brows Complete Collection for Eyeshadow Foundation Blending Application`;
  }
  if (lower.includes('vitamin c serum')) {
    return `Vitamin C Serum ${brand} Brightening Formula Antioxidant Protection Even Skin Tone Daily Skincare Treatment`;
  }
  if (lower.includes('multivitamin gummies')) {
    return `Multivitamin Gummies ${brand} Daily Nutrition Support Great Tasting Immune Health Energy for Adults Kids`;
  }
  if (lower.includes('digital blood pressure monitor')) {
    return 'Digital Blood Pressure Monitor Upper Arm Cuff Large Display Memory Function Home Health Tracking Device';
  }
  if (lower.includes('resistance bands set')) {
    return `Resistance Bands Set ${brand} Multiple Tension Levels Portable Workout Equipment for Strength Training`;
  }
  if (lower.includes('orthopedic pillow')) {
    return `Orthopedic Pillow ${brand} Memory Foam Contour Support Breathable Cover Neck Alignment Better Sleep`;
  }
  if (lower.includes('first aid kit complete')) {
    return `First Aid Kit Complete ${brand} Essential Medical Supplies Compact Case Home Travel Office Emergency Preparedness`;
  }
  if (lower.includes('gel ice pack reusable')) {
    return `Gel Ice Pack Reusable ${brand} Flexible Cold Therapy Pain Relief for Injuries Swelling and Muscle Recovery`;
  }
  if (lower.includes('non-stick frying pan')) {
    return `Non-Stick Frying Pan ${brand} Durable Coating Even Heat Distribution Ergonomic Handle Everyday Cooking Essential`;
  }
  if (lower.includes('cotton bed sheet set')) {
    return `Cotton Bed Sheet Set ${brand} Soft Breathable Fabric Hypoallergenic Comfort for Bedroom Guest Room Decor`;
  }
  if (lower.includes('led desk lamp')) {
    return `LED Desk Lamp ${brand} Adjustable Brightness Modern Minimalist Design USB Charging Port Eye Caring Light`;
  }
  if (lower.includes('robot vacuum cleaner')) {
    return `Robot Vacuum Cleaner ${brand} Smart Mapping Powerful Suction Multi Floor Cleaning App Control Quiet Operation`;
  }
  if (lower.includes('kitchen knife set')) {
    return `Kitchen Knife Set ${brand} High Carbon Steel Blades Ergonomic Handles Block Storage Precision Cutting Tools`;
  }
  if (lower.includes('bamboo cutting board')) {
    return `Bamboo Cutting Board ${brand} Eco Friendly Material Knife Friendly Surface Juice Groove Easy Clean Kitchen Tool`;
  }
  if (lower.includes('air purifier hepa')) {
    return `Air Purifier HEPA ${brand} Filter Removes Allergens Odors Pollutants Quiet Operation Bedroom Living Room Office`;
  }
  if (lower.includes('organic basmati rice')) {
    return `Organic Basmati Rice 5kg Aged Long Grain Aromatic Fluffy Texture Healthy Choice for Family Meals`;
  }
  if (lower.includes('extra virgin olive oil')) {
    return `Extra Virgin Olive Oil 1L Cold Pressed Premium Quality Rich Flavor Cooking Dressings Dipping Bread`;
  }
  if (lower.includes('dark chocolate')) {
    return `Dark Chocolate 70% Rich Cocoa Content Smooth Texture Premium Quality Healthy Indulgence for Snacking`;
  }
  if (lower.includes('green tea box')) {
    return `Green Tea Box 100 Bags Premium Selection Aromatic Leaves Antioxidant Rich Refreshing Daily Beverage`;
  }
  if (lower.includes('mixed nuts')) {
    return `Mixed Nuts 500g Premium Selection Roasted Unsalted Healthy Snack Protein Rich Energy for Active Lifestyle`;
  }
  if (lower.includes('honey raw')) {
    return `Honey Raw 500g Pure Natural Unprocessed Rich Golden Flavor Healthy Sweetener for Daily Wellness Recipes`;
  }
  if (lower.includes('yoga mat non-slip')) {
    return `Yoga Mat Non-Slip ${brand} Thick Cushioned Surface Eco Friendly Material Grip Stability for Fitness Exercises`;
  }
  if (lower.includes('dumbbells set 20kg')) {
    return `Dumbbells Set 20kg ${brand} Heavy Duty Steel Anti Slip Grip Hex Design Home Gym Strength Training Equipment`;
  }
  if (lower.includes('jump rope speed')) {
    return `Jump Rope Speed ${brand} Ball Bearings Adjustable Length Lightweight Cardio Training Fitness Equipment`;
  }
  if (lower.includes('cycling gloves')) {
    return `Cycling Gloves ${brand} Breathable Mesh Padded Palm Anti Shock Grip Full Finger Biking Accessory`;
  }
  if (lower.includes('tennis racket carbon')) {
    return `Tennis Racket Carbon ${brand} Lightweight Frame Balanced Control Durable Construction Player Performance Racket`;
  }
  if (lower.includes('camping tent 4-person')) {
    return `Camping Tent 4-Person ${brand} Waterproof Windproof Easy Setup Spacious Interior Family Outdoor Adventure Gear`;
  }
  if (lower.includes('car phone mount')) {
    return `Car Phone Mount ${brand} Adjustable Universal Grip 360 Rotation Windshield Dashboard Safe Driving Holder`;
  }
  if (lower.includes('microfiber car wash cloth')) {
    return `Microfiber Car Wash Cloth ${brand} Super Absorbent Lint Free Scratch Free Drying Polishing Vehicle Care`;
  }
  if (lower.includes('led car interior lights')) {
    return `LED Car Interior Lights ${brand} RGB Music Sync App Control Waterproof DIY Atmosphere Decoration Lighting`;
  }
  if (lower.includes('dash camera full hd')) {
    return `Dash Camera Full HD ${brand} Wide Angle Night Vision Loop Recording G Sensor Parking Mode Safety Device`;
  }
  if (lower.includes('tire pressure gauge')) {
    return `Tire Pressure Gauge ${brand} Digital Display Accurate Reading Durable Construction Car Truck Bike Tool`;
  }
  if (lower.includes('notebook a5 hardcover')) {
    return `Notebook A5 Hardcover ${brand} Premium Paper Lined Pages Bookmark Elastic Band Writing Journaling Notebook`;
  }
  if (lower.includes('gel pen set 12 colors')) {
    return `Gel Pen Set 12 Colors ${brand} Smooth Flow Fine Point Vibrant Inks Creative Drawing Writing Stationery Set`;
  }
  if (lower.includes('office desk organizer')) {
    return `Office Desk Organizer ${brand} Multi Compartment Storage Modern Design Desktop Supplies Files Accessories Holder`;
  }
  if (lower.includes('whiteboard marker pack')) {
    return `Whiteboard Marker Pack ${brand} Bold Colors Low Odor Quick Dry Erasable Classroom Office Presentation Markers`;
  }
  if (lower.includes('a4 printer paper')) {
    return `A4 Printer Paper 500 Sheets ${brand} Bright White Smooth Finish High Quality Printing Copying Office Paper`;
  }
  if (lower.includes('building blocks 1000 pcs')) {
    return `Building Blocks 1000 Pcs ${brand} Creative Construction STEM Learning Fun Educational Toy for Kids Family`;
  }
  if (lower.includes('board game strategy')) {
    return `Board Game Strategy ${brand} Engaging Gameplay Quality Components Family Fun Game Night Interactive Entertainment`;
  }
  if (lower.includes('remote control car')) {
    return `Remote Control Car ${brand} High Speed Off Road Control Rechargeable Battery Fun Kids Adults Toy Vehicle`;
  }
  if (lower.includes('puzzle 1000 pieces')) {
    return `Puzzle 1000 Pieces ${brand} Challenging Image High Quality Pieces Hobby Relaxation Group Activity Game`;
  }
  if (lower.includes('stuffed animal large')) {
    return `Stuffed Animal Large ${brand} Soft Plush Huggable Design Cute Companion Kids Bedroom Playroom Decor Plushie`;
  }
  if (lower.includes('baby onesie cotton')) {
    return `Baby Onesie Cotton ${brand} Soft Breathable Fabric Snap Closure Easy Change Everyday Essential Infant Clothing`;
  }
  if (lower.includes('diapers size 4 pack')) {
    return `Diapers Size 4 Pack ${brand} Super Absorbent Gentle Fit Skin Friendly Protection Active Babies Comfort`;
  }
  if (lower.includes('baby bottle sterilizer')) {
    return `Baby Bottle Sterilizer ${brand} Electric Steam Clean Fast Efficient Kills Germs Accessories Safe Hygiene`;
  }
  if (lower.includes('kids scooter 3-wheel')) {
    return `Kids Scooter 3-Wheel ${brand} Stable Balance Easy Fold Adjustable Height Safe Fun Outdoor Play Ride`;
  }
  if (lower.includes('wooden crib')) {
    return `Wooden Crib ${brand} Sturdy Construction Safe Non Toxic Materials Convertible Design Baby Nursery Furniture`;
  }
  if (lower.includes('silver pendant necklace')) {
    return `Silver Pendant Necklace ${brand} Elegant Design Polished Finish Minimalist Style Daily Wear Gift Jewelry`;
  }
  if (lower.includes('leather belt genuine')) {
    return `Leather Belt Genuine ${brand} Classic Strap Durable Buckle Perfect Fit Formal Casual Wardrobe Accessory`;
  }
  if (lower.includes('anklet gold plated')) {
    return `Anklet Gold Plated ${brand} Delicate Design Adjustable Length Beach Friendly Summer Women Ankle Jewelry`;
  }
  if (lower.includes('stud earrings set')) {
    return `Stud Earrings Set ${brand} High Quality Finish Multiple Styles Elegant Design Daily Special Occasion Wear`;
  }
  if (lower.includes('cordless drill 18v')) {
    return `Cordless Drill 18V ${brand} Powerful Motor Long Battery Life Ergonomic Grip Drilling Driving Tool`;
  }
  if (lower.includes('tape measure 5m')) {
    return `Tape Measure 5m ${brand} Durable Steel Blade Easy Lock Accurate Measurement DIY Construction Tool`;
  }
  if (lower.includes('socket set 40-piece')) {
    return `Socket Set 40-Piece ${brand} Chrome Vanadium Steel Organized Case Durable Tools Mechanics Home Repairs`;
  }
  if (lower.includes('safety helmet construction')) {
    return `Safety Helmet Construction ${brand} Durable Shell Adjustable Suspension Ventilation Work Site Head Protection`;
  }
  if (lower.includes('led work light')) {
    return `LED Work Light ${brand} High Brightness Rechargeable Battery Portable Job Site Emergency Task Lighting`;
  }
  if (lower.includes('garden hose 50m')) {
    return `Garden Hose 50m ${brand} Flexible Kink Resistant Durable Material Nozzle Watering Outdoor Cleaning Tool`;
  }
  if (lower.includes('plant pot ceramic')) {
    return `Plant Pot Ceramic ${brand} Modern Design Drainage Hole Lightweight Construction Indoor Plants Home Decor`;
  }
  if (lower.includes('solar garden lights')) {
    return `Solar Garden Lights ${brand} Waterproof Auto On Off Pathway Decoration Eco Friendly Outdoor Lighting Solution`;
  }
  if (lower.includes('bbq grill cover')) {
    return `BBQ Grill Cover ${brand} Heavy Duty Weatherproof Material Universal Fit Protects Outdoor Cooking Equipment`;
  }
  if (lower.includes('bird feeder hanging')) {
    return `Bird Feeder Hanging ${brand} Weatherproof Design Easy Fill Clear View Attracts Wild Birds Garden Decor`;
  }
  if (lower.includes('premium dog food 10kg')) {
    return `Premium Dog Food 10kg ${brand} Balanced Nutrition High Protein Healthy Ingredients Active Dogs Nutrition`;
  }
  if (lower.includes('cat scratching post')) {
    return `Cat Scratching Post ${brand} Durable Sisal Material Stable Base Keeps Furniture Safe Cat Entertainment`;
  }
  if (lower.includes('aquarium filter')) {
    return `Aquarium Filter ${brand} Quiet Operation Efficient Cleaning Adjustable Flow Freshwater Saltwater Tanks`;
  }
  if (lower.includes('pet grooming kit')) {
    return `Pet Grooming Kit ${brand} Clippers Scissors Brush Comb Rechargeable Dogs Cats Home Grooming Tools`;
  }
  if (lower.includes('dog leash reflective')) {
    return `Dog Leash Reflective ${brand} Strong Durable Padded Handle No Pull Design Safe Evening Walking Accessory`;
  }
  if (lower.includes('hard-shell suitcase 24 inch')) {
    return `Hard-shell Suitcase 24 inch ${brand} Lightweight Durable Hardside Spinner Wheels TSA Lock Travel Luggage`;
  }
  if (lower.includes('travel pillow memory foam')) {
    return `Travel Pillow Memory Foam ${brand} Ergonomic Design Neck Support Breathable Cover Airplane Car Home`;
  }
  if (lower.includes('packing cubes set')) {
    return `Packing Cubes Set ${brand} Compression Bags Lightweight Durable Travel Organizer Suitcase Backpack Accessory`;
  }
  if (lower.includes('passport holder rfid')) {
    return `Passport Holder RFID ${brand} Blocking Slim Design Premium Leather Look Secure Travel Document Organizer`;
  }
  if (lower.includes('standing desk converter')) {
    return `Standing Desk Converter ${brand} Smooth Height Adjustment Large Surface Ergonomic Workstation Home Office`;
  }
  if (lower.includes('ergonomic office chair')) {
    return `Ergonomic Office Chair ${brand} Lumbar Support Adjustable Height Breathable Mesh Long Work Comfort Seating`;
  }
  if (lower.includes('label printer thermal')) {
    return `Label Printer Thermal ${brand} High Speed Clear Printing USB Bluetooth Compatible Shipping Home Office`;
  }
  if (lower.includes('document shredder')) {
    return `Document Shredder ${brand} Cross Cut High Security Large Bin Overheat Protection Office Home Privacy Tool`;
  }
  if (lower.includes('projector 1080p')) {
    return `Projector 1080p ${brand} Bright Display Built In Speaker Multiple Connectivity Presentations Movie Nights`;
  }
  if (lower.includes('air fryer 6l')) {
    return `Air Fryer 6L ${brand} Large Capacity Rapid Air Technology Digital Controls Healthy Cooking Little Oil`;
  }
  if (lower.includes('microwave oven 25l')) {
    return `Microwave Oven 25L ${brand} Digital Display Even Heating Defrost Function Compact Kitchen Countertop Appliance`;
  }
  if (lower.includes('robot vacuum mop')) {
    return `Robot Vacuum Mop ${brand} Smart Navigation Suction Mopping Floor Cleaning App Control Modern Home Device`;
  }
  if (lower.includes('electric kettle 1.7l')) {
    return `Electric Kettle 1.7L ${brand} Fast Boil Auto Shut Off Stainless Steel Design Tea Coffee Instant Drinks`;
  }
  if (lower.includes('blender professional')) {
    return `Blender Professional ${brand} High Power Blades Multiple Speeds Smoothie Soup Ice Crushing Kitchen Appliance`;
  }
  if (lower.includes('office desk wooden')) {
    return `Office Desk Wooden ${brand} Spacious Surface Sturdy Construction Modern Style Home Office Study Room Furniture`;
  }
  if (lower.includes('bookshelf 5-tier')) {
    return `Bookshelf 5-Tier ${brand} Open Storage Design Sturdy Frame Versatile Shelving Books Decor Home Office Furniture`;
  }
  if (lower.includes('memory foam mattress')) {
    return `Memory Foam Mattress ${brand} Pressure Relief Support Medium Firm Breathable Cover Restful Sleep All Night`;
  }
  if (lower.includes('dining table 6-seater')) {
    return `Dining Table 6-Seater ${brand} Elegant Design Solid Surface Spacious Seating Family Meals Guests Furniture`;
  }
  if (lower.includes('wardrobe 3-door')) {
    return `Wardrobe 3-Door ${brand} Ample Storage Modern Design Hanging Rod Shelves Bedroom Closet Organization Furniture`;
  }
  if (lower.includes('t-shirts summer collection')) {
    return `T-Shirts Summer Collection Best Sale Ever With Execellent Quality and Cheapest Price With Great Stuff`;
  }
  if (lower.includes('premium cotton crew neck t-shirt')) {
    return `Premium Cotton Crew Neck T-Shirt for Men and Women Ultra Soft Breathable Casual Fit Tee Everyday Wear`;
  }

  if (lower.includes('t-shirts')) {
    return `${brand ? brand + ' ' : ''}Casual T-Shirt Soft Cotton Breathable Fit ${color} Color Everyday Wear Perfect Relaxed Style`;
  }
  if (lower.includes('high performance professional laptop')) {
    return `${brand ? brand + ' ' : ''}High Performance Professional Laptop 16GB RAM 512GB SSD Fast Processor Modern Design`;
  }
  if (lower.includes('elegant men\'s stainless steel analog watch')) {
    return `${brand ? brand + ' ' : ''}Elegant Men's Stainless Steel Analog Watch with Leather Strap Water Resistant Premium Design`;
  }
  if (lower.includes('long lasting premium eau de parfum')) {
    return `${brand ? brand + ' ' : ''}Long Lasting Premium Eau de Parfum 100ml Luxury Fragrance Spray for Men Elegant Scent`;
  }
  if (lower.includes('wireless bluetooth noise cancelling')) {
    return `${brand ? brand + ' ' : ''}Wireless Bluetooth Noise Cancelling Over Ear Headphones Deep Bass Long Battery Comfortable Fit`;
  }
  if (lower.includes('ergonomic wireless optical mouse')) {
    return `${brand ? brand + ' ' : ''}Ergonomic Wireless Optical Mouse 2.4GHz USB Receiver Silent Click Design Office Home Use`;
  }
  if (lower.includes('mechanical gaming keyboard rgb')) {
    return `${brand ? brand + ' ' : ''}Mechanical Gaming Keyboard RGB Backlit Wired USB Anti Ghosting Keys Premium Switches Durable`;
  }
  if (lower.includes('durable waterproof travel backpack')) {
    return `${brand ? brand + ' ' : ''}Durable Waterproof Travel Backpack 40L Laptop Compartment USB Charging Port Modern Design`;
  }
  if (lower.includes('cozy fleece hoodie for men')) {
    return `${brand ? brand + ' ' : ''}Cozy Fleece Hoodie for Men Warm Pullover Sweatshirt Casual Wear Soft Fabric Relaxed Fit`;
  }
  if (lower.includes('premium quality sports running shoes')) {
    return `${brand ? brand + ' ' : ''}Premium Quality Sports Running Shoes Lightweight Comfortable Durable Design Men Women Active Wear`;
  }
  if (lower.includes('genuine leather wallet for men')) {
    return `${brand ? brand + ' ' : ''}Genuine Leather Wallet for Men RFID Blocking Slim Bifold Card Holder Multiple Compartments`;
  }
  if (lower.includes('classic polarized uv protection sunglasses')) {
    return `${brand ? brand + ' ' : ''}Classic Polarized UV Protection Sunglasses for Men Women Unisex Fashion Sport Driving Eyewear`;
  }
  if (lower.includes('premium dog food')) {
    return `${brand ? brand + ' ' : ''}Premium Dog Food 10kg Balanced Nutrition High Protein Healthy Ingredients Active Dogs Diet`;
  }

  if (name.length > 60) {
    return name;
  }

  const additions = [
    `Premium ${category} Essential`,
    `${brand} Quality Design`,
    `Durable Everyday Use`,
    `${color} Modern Style`,
    `Comfortable Professional Grade`,
  ];

  const selected = additions.slice(0, 2).join(' ');
  return `${name} ${selected}`;
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
