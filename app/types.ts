export type Variation = {
    name: string;
    sku: string;
    variationId: string;
    stock: string;
    price: string;
};

export type InventoryItem = {
    itemId: string;
    name: string;
    variations?: Variation[];
    categories?: string[];
};

export type Category = {
    id: string;
    name: string;
}

export type Location = {
    id: string;
    name: string;
}
