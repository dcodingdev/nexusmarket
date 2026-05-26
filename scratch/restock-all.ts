import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://kadakiadev2806_db_user:dkadmin@cluster0.1vtedpe.mongodb.net/product_db?appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const connection = mongoose.connection;
    const productsColl = connection.collection('products');
    const stocksColl = connection.collection('stocks');

    const products = await productsColl.find({}).toArray();
    console.log(`Found ${products.length} products in database. Restocking all...`);

    for (const p of products) {
      const productId = p._id;
      // Get vendor ID from product record
      let vendorId = null;
      if (p.vendor) {
        if (p.vendor.id) {
          vendorId = p.vendor.id;
        } else if (p.vendor instanceof mongoose.Types.ObjectId) {
          vendorId = p.vendor;
        } else if (typeof p.vendor === 'string') {
          try {
            vendorId = new mongoose.Types.ObjectId(p.vendor);
          } catch (e) {}
        }
      }

      if (!vendorId) {
        // Fallback to a default vendor ID
        vendorId = new mongoose.Types.ObjectId('69f9a11e37475d5961536da9');
      } else {
        vendorId = new mongoose.Types.ObjectId(vendorId.toString());
      }

      const updateResult = await stocksColl.updateOne(
        { productId: new mongoose.Types.ObjectId(productId.toString()) },
        {
          $set: {
            vendorId: vendorId,
            quantity: 100,
            reservedQuantity: 0,
            status: 'IN_STOCK',
            lowStockThreshold: 10,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log(`Restocked Product ID: ${productId} (${p.name}). Result:`, updateResult.modifiedCount || updateResult.upsertedCount ? 'Updated' : 'No Change');
    }

    console.log('\nAll stocks verified and updated.');
  } catch (error) {
    console.error('Database operation failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

run();
