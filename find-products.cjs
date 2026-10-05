require("dotenv").config({ path: "./backend/.env" });

const mongoose = require("mongoose");

async function findProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const { databases } = await admin.listDatabases();

    console.log("\nDATABASES:");
    console.log(databases.map((db) => db.name));

    for (const database of databases) {
      if (["admin", "local", "config"].includes(database.name)) {
        continue;
      }

      const db = mongoose.connection.client.db(database.name);
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        if (collection.name !== "products") {
          continue;
        }

        const count = await db
          .collection("products")
          .countDocuments();

        console.log(
          `\nDB: ${database.name} | products: ${count}`
        );

        const matches = await db
          .collection("products")
          .find({
            $or: [
              { name: /WRX/i },
              { productId: /WRX/i }
            ]
          })
          .limit(10)
          .toArray();

        if (matches.length > 0) {
          console.log("\nWRX MATCH:");
          console.log(JSON.stringify(matches, null, 2));
        }
      }
    }
  } catch (error) {
    console.error("\nERROR:", error);
  } finally {
    await mongoose.disconnect();
  }
}

findProducts();