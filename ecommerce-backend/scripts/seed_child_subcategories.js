require('dotenv').config();
const mongoose = require('mongoose');
const Subcategory = require('../src/models/Subcategory');

const normalizeSlug = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const childNameMap = {
  'Air Conditioners': ['Split AC', 'Window AC', 'Inverter AC', 'Portable AC', 'Floor Standing AC', 'Tower AC', 'Cassette AC'],
  'Dryers': ['Vented Dryers', 'Heat Pump Dryers', 'Condenser Dryers', 'Washer Dryer Combos'],
  'Fans': ['Ceiling Fans', 'Pedestal Fans', 'Wall Fans', 'Table Fans', 'Exhaust Fans', 'Tower Fans'],
  'Freezers': ['Chest Freezers', 'Upright Freezers', 'Mini Freezers', 'Deep Freezers'],
  'Heaters': ['Electric Heaters', 'Gas Heaters', 'Oil Heaters', 'Infrared Heaters', 'Fan Heaters'],
  'Microwave Ovens': ['Solo Microwaves', 'Grill Microwaves', 'Convection Microwaves', 'Built-in Microwaves'],
  'Ovens': ['Conventional Ovens', 'Convection Ovens', 'Toaster Ovens', 'Microwave Ovens', 'Steam Ovens'],
  'Small Kitchen Appliances': ['Blenders', 'Mixers', 'Juicers', 'Food Processors', 'Rice Cookers', 'Kettles', 'Toasters'],
  'Vacuum Cleaners': ['Upright Vacuums', 'Canister Vacuums', 'Stick Vacuums', 'Robot Vacuums', 'Handheld Vacuums'],
  'Washing Machines': ['Front Load', 'Top Load', 'Semi-Automatic', 'Washer Dryer Combo'],
  'Mobile Phones': ['Smartphones', 'Feature Phones', 'Gaming Phones', 'Foldable Phones'],
  'Mobile Accessories': ['Cases & Covers', 'Screen Protectors', 'Chargers', 'Power Banks', 'Cables', 'Holders'],
  'Tablets': ['Android Tablets', 'iPads', 'Windows Tablets', 'Drawing Tablets'],
  'Laptops': ['Gaming Laptops', 'Business Laptops', 'Ultrabooks', 'Chromebooks', 'Workstations'],
  'Desktop Computers': ['Gaming Desktops', 'Office Desktops', 'All-in-One', 'Mini PCs'],
  'Computer Components': ['CPUs', 'GPUs', 'Motherboards', 'RAM', 'Storage', 'Power Supplies', 'Cases'],
  'Monitors': ['Gaming Monitors', 'Office Monitors', 'Curved Monitors', '4K Monitors', 'Portable Monitors'],
  'Printers & Scanners': ['Inkjet Printers', 'Laser Printers', 'All-in-One Printers', 'Scanners', '3D Printers'],
  'Networking': ['Routers', 'Modems', 'Switches', 'Range Extenders', 'Network Cables'],
  'Storage Devices': ['HDDs', 'SSDs', 'USB Drives', 'Memory Cards', 'External Drives', 'NAS'],
  'Cameras': ['DSLR Cameras', 'Mirrorless Cameras', 'Point & Shoot', 'Action Cameras', 'Security Cameras'],
  'Camera Accessories': ['Lenses', 'Tripods', 'Bags', 'Memory Cards', 'Flashes', 'Filters'],
  'Headphones & Earphones': ['Over-Ear', 'On-Ear', 'In-Ear', 'Wireless', 'Noise Cancelling', 'Gaming Headsets'],
  'Speakers': ['Bluetooth Speakers', 'Smart Speakers', 'Soundbars', 'Portable Speakers', 'Home Theater'],
  'TVs': ['LED TVs', 'OLED TVs', 'QLED TVs', 'Smart TVs', '4K TVs', '8K TVs'],
  'TV Accessories': ['TV Mounts', 'TV Stands', 'Streaming Devices', 'Remote Controls', 'Cables'],
  'Gaming': ['Gaming Laptops', 'Gaming Desktops', 'Gaming Accessories', 'Gaming Chairs', 'VR Headsets'],
  'Gaming Consoles': ['PlayStation', 'Xbox', 'Nintendo Switch', 'Steam Deck'],
  'Gaming Accessories': ['Controllers', 'Keyboards', 'Mice', 'Headsets', 'Charging Docks'],
  'Smart Watches': ['Fitness Trackers', 'GPS Watches', 'Smartwatch Bands', 'Screen Protectors'],
  'Smart Home': ['Smart Lights', 'Smart Plugs', 'Smart Cameras', 'Smart Locks', 'Smart Speakers'],
  'Power Banks': ['Portable Chargers', 'Wireless Chargers', 'Solar Chargers', 'Car Chargers'],
  'Chargers & Cables': ['USB-C Cables', 'Lightning Cables', 'Wireless Chargers', 'Car Chargers', 'Wall Chargers'],
  'Electronic Accessories': ['Adapters', 'Converters', 'Batteries', 'Tools', 'Cleaning Kits'],
  "Men's Clothing": ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Suits', 'Shorts', 'Sweatshirts'],
  "Women's Clothing": ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Kurtas', 'Sarees', 'Leggings', 'Jackets'],
  "Kids' Clothing": ['Boys Clothing', 'Girls Clothing', 'Baby Clothing', 'School Uniforms'],
  "Boys' Clothing": ['T-Shirts', 'Shirts', 'Shorts', 'Jeans', 'Jackets', 'Sweatshirts'],
  "Girls' Clothing": ['Dresses', 'Tops', 'Skirts', 'Jeans', 'Jackets', 'Frocks'],
  "Men's Shoes": ['Sneakers', 'Formal Shoes', 'Casual Shoes', 'Sports Shoes', 'Sandals', 'Loafers'],
  "Women's Shoes": ['Heels', 'Flats', 'Sneakers', 'Sandals', 'Boots', 'Ballet Flats'],
  "Kids' Shoes": ['School Shoes', 'Sneakers', 'Sandals', 'Boots', 'Sports Shoes'],
  'Bags': ['Backpacks', 'Handbags', 'Tote Bags', 'Clutches', 'Duffel Bags', 'Laptop Bags'],
  'Backpacks': ['School Backpacks', 'Laptop Backpacks', 'Travel Backpacks', 'Hiking Backpacks'],
  'Wallets': ['Men Wallets', 'Women Wallets', 'Card Holders', 'Money Clips'],
  'Belts': ['Leather Belts', 'Casual Belts', 'Formal Belts', 'Reversible Belts'],
  'Hats & Caps': ['Baseball Caps', 'Beanies', 'Sun Hats', 'Bucket Hats', 'Snapbacks'],
  'Scarves': ['Silk Scarves', 'Wool Scarves', 'Cashmere Scarves', 'Winter Scarves'],
  'Socks': ['Ankle Socks', 'Crew Socks', 'Knee-High Socks', 'Sports Socks', 'Compression Socks'],
  'Innerwear': ['Briefs', 'Boxers', 'Trunks', 'Bras', 'Panties', 'Thermal Wear'],
  'Watches': ['Analog Watches', 'Digital Watches', 'Smart Watches', 'Luxury Watches', 'Sport Watches'],
  'Fashion Accessories': ['Keychains', 'Cufflinks', 'Tie Pins', 'Pocket Squares', 'Sunglasses'],
  'Sunglasses': ['Aviators', 'Wayfarers', 'Round Sunglasses', 'Cat Eye', 'Sports Sunglasses'],
  'Jewelry': ['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Anklets', 'Pendants'],
  'Makeup': ['Foundation', 'Lipstick', 'Mascara', 'Eyeshadow', 'Kajal', 'Primer', 'Setting Spray'],
  'Skincare': ['Moisturizers', 'Sunscreen', 'Serums', 'Cleansers', 'Toners', 'Face Masks'],
  'Hair Care': ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Color', 'Hair Serum', 'Hair Masks'],
  'Fragrances': ['Perfumes', 'Eau de Toilette', 'Body Mists', 'Deodorants', 'Fragrance Gift Sets'],
  "Men's Grooming": ['Beard Oil', 'Face Wash', 'Shaving Cream', 'Hair Gel', 'Aftershave'],
  'Bath & Body': ['Body Wash', 'Soaps', 'Body Scrubs', 'Lotions', 'Body Oils'],
  'Oral Care': ['Toothpaste', 'Toothbrushes', 'Mouthwash', 'Dental Floss', 'Teeth Whitening'],
  'Beauty Tools': ['Hair Dryers', 'Straighteners', 'Curling Irons', 'Makeup Brushes', 'Beauty Blenders'],
  'Nail Care': ['Nail Polish', 'Nail Removers', 'Nail Files', 'Gel Polish', 'Nail Kits'],
  'Personal Hygiene': ['Sanitary Pads', 'Tampons', 'Hand Sanitizers', 'Wipes', 'Cotton Swabs'],
  'Hair Styling Tools': ['Hair Dryers', 'Straighteners', 'Curling Irons', 'Hair Stylers', 'Hot Air Brushes'],
  'Vitamins & Supplements': ['Multivitamins', 'Vitamin C', 'Vitamin D', 'Omega 3', 'Protein Supplements'],
  'Medical Supplies': ['First Aid Kits', 'Bandages', 'Thermometers', 'Blood Pressure Monitors', 'Nebulizers'],
  'Fitness & Wellness': ['Yoga Mats', 'Dumbbells', 'Resistance Bands', 'Foam Rollers', 'Kettlebells'],
  'Personal Care': ['Body Wash', 'Lotions', 'Deodorants', 'Hair Care', 'Oral Care'],
  'First Aid': ['Bandages', 'Antiseptics', 'Gauze', 'Tape', 'Scissors', 'Gloves'],
  'Health Monitoring': ['Blood Pressure Monitors', 'Glucometers', 'Thermometers', 'Pulse Oximeters'],
  'Mobility & Support': ['Walking Sticks', 'Knee Braces', 'Ankle Supports', 'Back Belts', 'Wheelchairs'],
  'Healthcare Devices': ['Nebulizers', 'CPAP Machines', 'Massagers', 'Heating Pads', 'TENS Units'],
  'Furniture': ['Sofas', 'Beds', 'Tables', 'Chairs', 'Wardrobes', 'TV Units', 'Bookshelves'],
  'Home Decor': ['Wall Art', 'Clocks', 'Vases', 'Candles', 'Mirrors', 'Photo Frames', 'Rugs'],
  'Kitchen & Dining': ['Dinnerware', 'Cutlery', 'Glassware', 'Table Linens', 'Serveware'],
  'Kitchen Appliances': ['Mixer Grinders', 'Blenders', 'Food Processors', 'Kettles', 'Toasters'],
  'Cookware': ['Pressure Cookers', 'Frying Pans', 'Saucepans', 'Casserole Dishes', 'Non-stick Pans'],
  'Bakeware': ['Baking Trays', 'Cake Molds', 'Cookie Sheets', 'Muffin Tins', 'Pie Dishes'],
  'Storage & Organization': ['Storage Boxes', 'Wardrobe Organizers', 'Kitchen Organizers', 'Shoe Racks'],
  'Cleaning Supplies': ['Floor Cleaners', 'Glass Cleaners', 'Disinfectants', 'Mops', 'Brooms', 'Sponges'],
  'Bedding': ['Bedsheets', 'Pillows', 'Blankets', 'Mattress Protectors', 'Quilts', 'Pillow Covers'],
  'Bath': ['Towels', 'Bath Mats', 'Shower Curtains', 'Soap Dishes', 'Tissue Boxes'],
  'Lighting': ['Ceiling Lights', 'Table Lamps', 'Floor Lamps', 'Wall Lights', 'LED Strips', 'Bulbs'],
  'Curtains & Blinds': ['Blackout Curtains', 'Sheer Curtains', 'Venetian Blinds', 'Roller Blinds'],
  'Home Improvement': ['Paint', 'Wallpaper', 'Tools', 'Hardware', 'Locks', 'Hinges'],
  'Household Supplies': ['Trash Bags', 'Detergents', 'Fabric Softeners', 'Stain Removers', 'Air Fresheners'],
  'Fresh Food': ['Fruits', 'Vegetables', 'Meat', 'Seafood', 'Dairy', 'Bakery'],
  'Packaged Food': ['Snacks', 'Noodles', 'Pasta', 'Cereals', 'Canned Food', 'Ready Meals'],
  'Beverages': ['Water', 'Juices', 'Soft Drinks', 'Tea', 'Coffee', 'Energy Drinks'],
  'Snacks': ['Chips', 'Biscuits', 'Chocolates', 'Nuts', 'Dry Fruits', 'Namkeen'],
  'Breakfast Foods': ['Cereals', 'Oats', 'Bread', 'Butter', 'Jam', 'Honey', 'Granola'],
  'Cooking Essentials': ['Oil', 'Spices', 'Salt', 'Sugar', 'Rice', 'Flour', 'Lentils'],
  'Baking Ingredients': ['Flour', 'Sugar', 'Baking Powder', 'Vanilla Extract', 'Chocolate Chips', 'Yeast'],
  'Canned & Preserved Food': ['Canned Vegetables', 'Canned Fruits', 'Pickles', 'Jams', 'Sauces'],
  'International Foods': ['Sushi', 'Pasta', 'Tacos', 'Dim Sum', 'Croissants', 'Kimchi'],
  'Baby Food': ['Baby Cereal', 'Baby Purees', 'Baby Snacks', 'Formula Milk', 'Baby Biscuits'],
  'Household Groceries': ['Detergents', 'Dishwash', 'Toilet Paper', 'Trash Bags', 'Light Bulbs'],
  'Exercise Equipment': ['Treadmills', 'Ellipticals', 'Exercise Bikes', 'Rowing Machines', 'Home Gyms'],
  'Fitness Accessories': ['Yoga Mats', 'Dumbbells', 'Resistance Bands', 'Foam Rollers', 'Jump Ropes'],
  'Running': ['Running Shoes', 'Running Socks', 'Running Shorts', 'Running Tights', 'Running Vests'],
  'Cycling': ['Bicycles', 'Cycling Shoes', 'Cycling Helmets', 'Cycling Gloves', 'Bike Locks'],
  'Outdoor Sports': ['Camping Gear', 'Hiking Boots', 'Backpacks', 'Tents', 'Sleeping Bags'],
  'Team Sports': ['Football', 'Cricket', 'Basketball', 'Tennis', 'Volleyball', 'Badminton'],
  'Football': ['Football Boots', 'Football Kits', 'Football Balls', 'Football Gloves', 'Shin Guards'],
  'Cricket': ['Cricket Bats', 'Cricket Balls', 'Cricket Pads', 'Cricket Gloves', 'Cricket Helmets'],
  'Basketball': ['Basketball Shoes', 'Basketball Jerseys', 'Basketballs', 'Basketball Hoops'],
  'Tennis': ['Tennis Rackets', 'Tennis Balls', 'Tennis Shoes', 'Tennis Bags'],
  'Swimming': ['Swimsuits', 'Swim Caps', 'Goggles', 'Fins', 'Snorkels'],
  'Yoga': ['Yoga Mats', 'Yoga Blocks', 'Yoga Straps', 'Yoga Towels', 'Yoga Clothing'],
  'Books': ['Fiction', 'Non-Fiction', 'Textbooks', 'Comics', 'Children Books', 'Audiobooks'],
  'Stationery': ['Pens', 'Notebooks', 'Folders', 'Staplers', 'Markers', 'Highlighters'],
  'Office Supplies': ['Desk Organizers', 'Paper Clips', 'Sticky Notes', 'Envelopes', 'Printer Paper'],
  'Art & Craft': ['Paints', 'Brushes', 'Canvas', 'Sketchbooks', 'Glue', 'Scissors'],
  'Pet Food': ['Dog Food', 'Cat Food', 'Bird Food', 'Fish Food', 'Small Pet Food'],
  'Pet Accessories': ['Collars', 'Leashes', 'Beds', 'Carriers', 'Toys', 'Grooming Tools'],
  'Pet Health': ['Vitamins', 'Flea Control', 'Dewormers', 'Dental Care', 'Supplements'],
  'Aquarium': ['Fish Tanks', 'Filters', 'Lighting', 'Decorations', 'Fish Food', 'Water Conditioners'],
  'Small Pets': ['Hamster Cages', 'Bird Cages', 'Rabbit Hutches', 'Guinea Pig Supplies'],
  'Gifts & Toys': ['Board Games', 'Puzzles', 'Dolls', 'Action Figures', 'Educational Toys', 'Remote Control'],
  'Toys': ['Soft Toys', 'Building Blocks', 'Puzzles', 'Board Games', 'Outdoor Toys', 'Educational Toys'],
  'Games': ['Board Games', 'Card Games', 'Puzzle Games', 'Video Games', 'Outdoor Games'],
  'Educational Toys': ['STEM Toys', 'Learning Kits', 'Science Kits', 'Art Supplies', 'Musical Toys'],
  'Remote Control': ['RC Cars', 'RC Drones', 'RC Planes', 'RC Boats', 'RC Helicopters'],
  'Action Figures': ['Superheroes', 'Anime Figures', 'Movie Characters', 'Sports Figures', 'Fantasy Figures'],
  'Dolls': ['Fashion Dolls', 'Baby Dolls', 'Barbie Dolls', 'Dollhouses', 'Doll Accessories'],
  'Puzzles': ['Jigsaw Puzzles', '3D Puzzles', 'Brain Teasers', 'Sudoku', "Rubik's Cube"],
  'Building Blocks': ['LEGO', 'Mega Bloks', 'Magnetic Blocks', 'Wooden Blocks', 'Castle Blocks'],
  'Soft Toys': ['Teddy Bears', 'Stuffed Animals', 'Plush Toys', 'Squishmallows', 'Beanie Babies'],
  'Board Games': ['Strategy Games', 'Party Games', 'Family Games', 'Card Games', 'Trivia Games'],
  'Luggage': ['Suitcases', 'Carry-Ons', 'Travel Bags', 'Duffel Bags', 'Backpacks', 'Wallets'],
  'Travel Accessories': ['Travel Pillows', 'Eye Masks', 'Luggage Tags', 'Passport Holders', 'Travel Kits'],
  'Backpacks': ['School Backpacks', 'Laptop Backpacks', 'Travel Backpacks', 'Hiking Backpacks'],
  'Suitcases': ['Hard Shell', 'Soft Shell', 'Carry-On', 'Checked Luggage', 'Spinner Suitcases'],
  'Travel Bags': ['Duffel Bags', 'Weekender Bags', 'Tote Bags', 'Garment Bags', 'Packing Cubes'],
  'Travel Pillows': ['Memory Foam', 'Inflatable', 'Neck Pillows', 'Lumbar Pillows', 'Travel Blankets'],
};

function generateChildNames(parentName, count) {
  const names = childNameMap[parentName];
  if (names && names.length > 0) {
    const shuffled = [...names].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const suffixes = ['Pro', 'Max', 'Plus', 'Mini', 'Elite', 'Classic', 'Premium', 'Standard', 'Basic', 'Advanced'];
  const result = [];
  const used = new Set();
  let attempts = 0;
  while (result.length < count && attempts < 50) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${parentName} ${suffix}`;
    if (!used.has(name)) {
      used.add(name);
      result.push(name);
    }
    attempts++;
  }
  return result;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to:', mongoose.connection.name);

    const subcategories = await Subcategory.find({}).sort({ category: 1, name: 1 }).lean();
    console.log(`Found ${subcategories.length} subcategories`);

    const allExisting = await Subcategory.find({}).select('category slug parent').lean();
    const existingSet = new Set(allExisting.map(s => `${s.category}-${s.slug}`));

    const bulk = [];
    let childrenCreated = 0;
    let childrenSkipped = 0;

    for (const sub of subcategories) {
      const existingChildren = allExisting.filter(s => s.parent && s.parent.toString() === sub._id.toString());
      if (existingChildren.length >= 8) {
        childrenSkipped++;
        continue;
      }

      const needed = 8 - existingChildren.length;
      const childNames = generateChildNames(sub.name, needed);

      for (const childName of childNames) {
        let childSlug = normalizeSlug(childName);
        let suffix = 0;
        let key = `${sub.category}-${childSlug}`;
        while (existingSet.has(key)) {
          suffix++;
          childSlug = `${normalizeSlug(childName)}-${suffix}`;
          key = `${sub.category}-${childSlug}`;
        }

        bulk.push({
          name: childName,
          slug: childSlug,
          category: sub.category,
          parent: sub._id,
          isActive: true,
        });
        existingSet.add(key);
        childrenCreated++;
      }
    }

    if (bulk.length > 0) {
      await Subcategory.insertMany(bulk, { ordered: false });
      console.log(`\nInserted ${bulk.length} child subcategories in bulk.`);
    }

    console.log('\n=== Seed Summary ===');
    console.log(`Subcategories skipped (already had >=5 children): ${childrenSkipped}`);
    console.log(`Child subcategories created: ${childrenCreated}`);
    console.log('Seed completed successfully.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
