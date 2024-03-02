import Product from "../models/product.js";
import asyncHandler from 'express-async-handler';



const calculateQuantity = asyncHandler(async (req, res) => {
    try {
        const orderItems = req.body.orderItems;
        for (const orderItem of orderItems) {
            const { product, color, size, quantity } = orderItem;
            // Find the product by ID
            const productToUpdate = await Product.findById(product);
            // Iterate over variations
            for (const variation of productToUpdate.variations) {
               
                // Find the specific color within the variation
                const colorToUpdate = variation.colors.find(c => c.color === color);
                // Check if colorToUpdate is not undefined
                if (colorToUpdate) {
                    // Find the specific size within the color
                    const sizeToUpdate = colorToUpdate.sizes.find(s => s.enum[0] === size);
                    // console.log(sizeToUpdate);
                    // Check if sizeToUpdate is not undefined
                    if (sizeToUpdate) {
                        // Update the quantity
                        sizeToUpdate.quantitySizes -= quantity;
                        colorToUpdate.quantity -= quantity;
                    } else {
                        console.error(`Size "${size}" not found for color "${color}" in variation "${variation._id}".`);
                    }
                } else {
                    console.error(`Color "${color}" not found in variation "${variation._id}".`);
                }
            }
            const newtotalQuantityProducts = productToUpdate.totalQuantityProducts - quantity;
            console.log(newtotalQuantityProducts)
            productToUpdate.totalQuantityProducts=newtotalQuantityProducts
            // console.log(quantity)

            // Save the updated product to the database
            await productToUpdate.save();
         
        }
       
        res.status(200).json({ message: 'Order placed successfully.' });
    } catch (error) {
        console.error('Error updating quantities:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
   
});

export { calculateQuantity };