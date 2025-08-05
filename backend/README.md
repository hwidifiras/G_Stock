# Stock Management Backend

A complete Node.js backend for stock management (gestion de stock) application built with Express.js and MongoDB.

## Features

- ✅ RESTful API for product management
- ✅ MongoDB integration with Mongoose
- ✅ Complete CRUD operations
- ✅ Stock level tracking and low stock alerts
- ✅ Advanced filtering and pagination
- ✅ Error handling and validation
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Request logging and response time tracking
- ✅ Graceful shutdown handling

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   └── productController.js  # Business logic for products
├── middlewares/
│   └── errorMiddleware.js    # Error handling and logging
├── models/
│   └── Product.js           # Product schema and model
├── routes/
│   ├── index.js             # Main routes configuration
│   └── productRoutes.js     # Product-specific routes
├── utils/
│   └── helpers.js           # Utility functions
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── server.js               # Main server file
```

## Installation

1. **Clone and navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env` file and update with your MongoDB URI:
   ```
   MONGO_URI=mongodb://localhost:27017/gestion_stock
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Base URL: `http://localhost:5000`

### Health Check
- `GET /api/health` - Check API status

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filtering) |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/low-stock` | Get low stock products |
| PATCH | `/api/products/:id/stock` | Update stock quantity |

### Query Parameters for GET /api/products

- `category` - Filter by category
- `status` - Filter by status (active, inactive, discontinued)
- `search` - Search in name, reference, description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: asc/desc (default: desc)

### Example API Requests

#### Create Product
```json
POST /api/products
{
  "name": "Laptop Dell XPS 13",
  "reference": "DELL-XPS-001",
  "quantity": 50,
  "price": 1299.99,
  "description": "High-performance ultrabook",
  "category": "Electronics",
  "minStock": 5,
  "unit": "piece"
}
```

#### Update Stock
```json
PATCH /api/products/:id/stock
{
  "quantity": 10,
  "operation": "add"  // "set", "add", or "subtract"
}
```

#### Get Products with Filtering
```
GET /api/products?category=Electronics&page=1&limit=5&sortBy=name&sortOrder=asc
```

## Product Schema

```javascript
{
  name: String (required),
  reference: String (required, unique),
  quantity: Number (required, min: 0),
  price: Number (required, min: 0),
  description: String (optional),
  category: String (required),
  minStock: Number (default: 5),
  unit: String (enum: piece, kg, liter, box, other),
  status: String (enum: active, inactive, discontinued),
  createdAt: Date,
  updatedAt: Date
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error details"]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/gestion_stock` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Centralized error management

## Database Connection

The application automatically connects to MongoDB on startup. Make sure MongoDB is running locally or update the `MONGO_URI` in `.env` to point to your MongoDB Atlas cluster.

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Logging

The application includes comprehensive logging:
- Request logging with timestamps and IP addresses
- Response time tracking
- Error logging with stack traces (development mode)
- MongoDB connection status

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Update `MONGO_URI` to production database
3. Configure CORS origins for your frontend domain
4. Set up process manager (PM2) for production:

```bash
npm install -g pm2
pm2 start server.js --name "stock-api"
pm2 startup
pm2 save
```

## Testing the API

You can test the API using tools like:
- **Postman** - Import the endpoints as a collection
- **curl** - Command line testing
- **Thunder Client** - VS Code extension
- **Frontend application** - Connect your React/Vue/Angular app

### Example curl commands:

```bash
# Get all products
curl http://localhost:5000/api/products

# Create a product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","reference":"TEST-001","quantity":10,"price":29.99,"category":"Test"}'

# Check API health
curl http://localhost:5000/api/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
