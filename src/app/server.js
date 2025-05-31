// server.js
import express from 'express';
import { SquareClient, SquareEnvironment } from 'square';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());


const athome_stock = new Map([
    // white angel shirt
    ["70", 7], // M
    ["71", 7], // L
    // idol shirt
    // white
    ["72", 4], // M
    ["74", 5], // M

    // star girls shirt
    // black (grey)
    ["76", 7],
    ["77", 7],

    //totes
    ["19", 8], // dig nos
    ["26", 4], // goodnight kiss
    ["35", 4], // meiberry lounge
    ["38", 7], // mona and pals
    ["63", 5], // rockstar
    ["54", 4], // roommates
    ["69", 5], // u died

    // mini totes
    ["45", 8], // moon
    ["31", 6], // life is good
    ["15", 7], // dancing tote

]);


const client = new SquareClient({
    environment: SquareEnvironment.Production,
    token: process.env.SQUARE_API_KEY,
});

app.get('/api/catalog/list', async (req, res) => {
    try {
        const categoryResponse = await client.catalog.list({
            types: 'CATEGORY',
        });

        const categories = new Map(categoryResponse.response.objects.map((category) => ([category.id, category.categoryData.name])))

        const inventoryResponse = await client.inventory.batchGetCounts({
            locationIds: [
                process.env.LOCATION_ID,
            ]
        })

        const inventoryMap = new Map(inventoryResponse.response.counts.map((count) => ([count.catalogObjectId, count.quantity])));

        const { response } = await client.catalog.list({
            types: 'ITEM',
        });
        const items = response.objects.map((item) => (
            {
                itemId: item.id,
                name: item.itemData.name,
                variations: item.itemData.variations.map((variation) => (
                    {
                        name: variation.itemVariationData.name,
                        sku: variation.itemVariationData.sku,
                        variationId: variation.id,
                        stock: (inventoryMap.get(variation.id) || 0) - (athome_stock.get(variation.itemVariationData.sku) || 0)
                    }
                )),
                categories: item.itemData.categories.map((category) => (categories.get(category.id)))
            }
        ))
        res.json(items);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get whole catalog' });
    }
})

app.listen(4000, () => {
    console.log('Proxy server running on http://localhost:4000');
});
