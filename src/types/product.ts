// Define a Product type based on expected fields from your products table
export interface Product {
  id: string;
  name: string;
  image_url: string | undefined;
  price: number;
  category: string;
  gender: string;
  object_url: string;
  ml_id: number;
} 