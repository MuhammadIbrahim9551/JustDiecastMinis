const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const products = [
  {
    id: 1,
    name: "Lamborghini Countach LP400",
    brand: "Tomica",
    series: "",
    vehicleMaker: "Lamborghini",
    scale: "1:64",
    category: "new-arrivals",
    type: ["Supercars"],
    price: 999,
    status: "in-stock",
    images: [
      "public/images/lp400.jpg",
      "public/images/lp400-2.webp"
    ]
  },
  {
    id: 2,
    name: "Nissan Skyline GT-R R34",
    brand: "Mini GT",
    series: "",
    vehicleMaker: "Nissan",
    scale: "1:64",
    category: "new-arrivals",
    type: ["JDM", "Race cars", "Coupes", "GTs"],
    price: 1499,
    status: "pre-order",
    images: [
      "public/images/r34.webp"
    ]
  },
  {
    id: 3,
    name: "Lancia Delta Integrale Evo II",
    brand: "HotWheels",
    series: "Premium",
    vehicleMaker: "Lancia",
    scale: "1:64",
    category: "new-arrivals",
    type: ["Rally", "Hatches"],
    price: 799,
    status: "out-of-stock",
    images: [
      "public/images/delta.webp"
    ]
  },
  {
    id: 4,
    name: "Toyota MR2 AW11",
    brand: "Tomica",
    series: "",
    vehicleMaker: "Toyota",
    scale: "1:64",
    category: "new-arrivals",
    type: ["JDM", "Coupes"],
    price: 899,
    status: "in-stock",
    images: [
      "public/images/aw11.jpg"
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log("Products seeded successfully.");

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();