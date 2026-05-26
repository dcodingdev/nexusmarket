const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://kadakiadev2806_db_user:dkadmin@cluster0.1vtedpe.mongodb.net/product_db?appName=Cluster0';

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db();
    
    const productsColl = db.collection('products');
    const stocksColl = db.collection('stocks');

    const products = await productsColl.find({}).toArray();
    console.log(`Found ${products.length} products:`);
    for (const p of products) {
      const stock = await stocksColl.findOne({ productId: p._id });
      console.log(`- ID: ${p._id}`);
      console.log(`  Name: ${p.name}`);
      console.log(`  Vendor: ${p.vendor ? p.vendor.id || p.vendor : 'N/A'}`);
      if (stock) {
        console.log(`  Stock - Quantity: ${stock.quantity}, Reserved: ${stock.reservedQuantity}, Status: ${stock.status}`);
      } else {
        console.log(`  Stock - NO STOCK RECORD FOUND`);
      }
    }
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await client.close();
  }
}

run();
