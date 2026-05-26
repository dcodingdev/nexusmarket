const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb+srv://kadakiadev2806_db_user:dkadmin@cluster0.1vtedpe.mongodb.net/product_db?appName=Cluster0';

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db();
    const stocksColl = db.collection('stocks');

    // 1. List all stock records
    const allStocks = await stocksColl.find({}).toArray();
    console.log('Current stock records in database:', allStocks.length);
    for (const s of allStocks) {
      console.log(`Product ID: ${s.productId}, Quantity: ${s.quantity}, Reserved: ${s.reservedQuantity}, Status: ${s.status}`);
    }

    // 2. Insert or update stock for the test product
    const targetProductId = new ObjectId('69fb07825ce69d54db29357c');
    const targetVendorId = new ObjectId('69f9a11e37475d5961536da9');

    const updateResult = await stocksColl.updateOne(
      { productId: targetProductId },
      {
        $set: {
          vendorId: targetVendorId,
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

    console.log('\nUpdated/Upserted stock record:');
    console.log(updateResult);

    // Verify updated stock
    const updatedStock = await stocksColl.findOne({ productId: targetProductId });
    console.log('New stock record for target product:', updatedStock);
  } catch (error) {
    console.error('Database operation failed:', error);
  } finally {
    await client.close();
  }
}

run();
