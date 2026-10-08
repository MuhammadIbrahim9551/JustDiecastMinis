const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    ordersEnabled: {
      type: Boolean,
      default: true
    },

    youtubeShowcaseUrl: {
      type: String,
      default: ""
    },

    catalogOptions: {
      modelMakers: {
        type: [String],
        default: [
          "HotWheels",
          "Tomica",
          "Mini GT",
          "Kyosho",
          "Bburago",
          "Majorette",
          "M2 Machines",
          "CCA",
          "Massdi",
          "Matchbox",
          "Poster Cars",
          "Para64",
          "LCD Models",
          "Disney",
          "Time Micro",
          "Trends Hobby",
          "Hobby Japan",
          "Pop Race",
          "Others"
        ]
      },

      scales: {
        type: [String],
        default: [
          "1:64",
          "1:43",
          "1:32",
          "1:24",
          "1:18"
        ]
      },

      vehicleMakers: {
        type: [String],
        default: [
          "Toyota",
          "Nissan",
          "Honda",
          "Mazda",
          "Subaru",
          "Mitsubishi",
          "Isuzu",
          "Suzuki",
          "Daihatsu",
          "Lexus",
          "Acura",
          "Infiniti",
          "GR",
          "BMW",
          "Porsche",
          "Ferrari",
          "Lamborghini",
          "Lancia",
          "Alfa Romeo",
          "Ford",
          "Chevrolet",
          "Jeep",
          "GMC",
          "Mercedes Benz",
          "Volkswagen",
          "Audi",
          "Jaguar",
          "Bugatti",
          "Koenigsegg",
          "Pagani",
          "Fiat",
          "Mini",
          "Peugeot",
          "Lotus",
          "Renault",
          "Citroen",
          "Bentley",
          "Aston Martin",
          "Maserati",
          "McLaren",
          "Pontiac",
          "Cadillac",
          "Rolls Royce",
          "Dodge",
          "Chrysler",
          "Plymouth",
          "Tata",
          "Mahindra",
          "Holden",
          "Saab",
          "Skoda",
          "Seat",
          "Hyundai",
          "Genesis",
          "Kia",
          "Others"
        ]
      },

      types: {
        type: [String],
        default: [
          "JDM",
          "GTs",
          "Coupes",
          "Hatches",
          "Sedans",
          "Estates",
          "Supercars",
          "Classics",
          "Race Cars",
          "Rally",
          "Kei Cars",
          "Vintage",
          "SUVs",
          "MPVs",
          "Trucks",
          "Vans",
          "Motorcycles",
          "Others"
        ]
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "StoreSettings",
  storeSettingsSchema
);
