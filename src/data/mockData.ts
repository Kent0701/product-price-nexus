
// Mock data for products
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  currentPrice: number;
  previousPrice?: number;
  inStock: boolean;
  priceHistory: PriceEntry[];
}

export interface PriceEntry {
  date: string;
  price: number;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
    category: "Electronics",
    currentPrice: 199.99,
    previousPrice: 249.99,
    inStock: true,
    priceHistory: [
      { date: "2025-01-15", price: 249.99 },
      { date: "2025-02-01", price: 229.99 },
      { date: "2025-03-10", price: 199.99 }
    ]
  },
  {
    id: "2",
    name: "Smart Watch",
    description: "Fitness and health tracking smartwatch with heart rate monitor",
    category: "Electronics",
    currentPrice: 149.99,
    inStock: true,
    priceHistory: [
      { date: "2025-01-15", price: 149.99 }
    ]
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    description: "Waterproof portable Bluetooth speaker with 24-hour playtime",
    category: "Electronics",
    currentPrice: 79.99,
    previousPrice: 99.99,
    inStock: true,
    priceHistory: [
      { date: "2025-01-15", price: 99.99 },
      { date: "2025-03-15", price: 79.99 }
    ]
  },
  {
    id: "4",
    name: "Ergonomic Office Chair",
    description: "Adjustable office chair with lumbar support and breathable mesh",
    category: "Furniture",
    currentPrice: 189.99,
    previousPrice: 219.99,
    inStock: false,
    priceHistory: [
      { date: "2025-01-10", price: 219.99 },
      { date: "2025-02-20", price: 189.99 }
    ]
  },
  {
    id: "5",
    name: "Standing Desk",
    description: "Electric height-adjustable standing desk with memory settings",
    category: "Furniture",
    currentPrice: 299.99,
    inStock: true,
    priceHistory: [
      { date: "2025-01-10", price: 299.99 }
    ]
  },
  {
    id: "6",
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical gaming keyboard with customizable keys",
    category: "Electronics",
    currentPrice: 129.99,
    previousPrice: 149.99,
    inStock: true,
    priceHistory: [
      { date: "2025-01-15", price: 149.99 },
      { date: "2025-04-01", price: 129.99 }
    ]
  }
];

// Mock data for users
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  joinedDate: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    joinedDate: "Jan 10, 2025"
  },
  {
    id: "2",
    name: "Jane User",
    email: "jane@example.com",
    role: "user",
    status: "active",
    joinedDate: "Jan 15, 2025"
  },
  {
    id: "3",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "user",
    status: "inactive",
    joinedDate: "Feb 5, 2025"
  }
];
