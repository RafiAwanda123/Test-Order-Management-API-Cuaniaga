# Test Order Management API Cuaniaga

RESTful API sederhana untuk sistem manajemen pemesanan, mencakup autentikasi, produk, pemesanan, dan riwayat.

## Repository
https://github.com/RafiAwanda123/Test-Order-Management-API-Cuaniaga/

## Teknologi
- Node.js & Express.js
- JWT untuk autentikasi
- CURD produk hanya Admin
- Middleware untuk validasi dan error handling
- SQL

## Fitur

### 1. Login & Autentikasi
- Endpoint login mengembalikan token JWT untuk digunakan pada endpoint lainnya.

### 2. Produk (hanya Admin)
- **POST /products** – tambah produk
- **PUT /products/:id** – edit produk
- **DELETE /products/:id** – hapus produk
- **GET /products** – lihat semua produk (tanpa autentikasi jadi semua user bisa lihat)
  
### 3. Pemesanan oleh Customer
- **POST /orders** – buat pesanan (stok produk berkurang otomatis)
- **GET /orders/history** – lihat riwayat pesanan customer yang sedang login
- **GET /orders/:id** - lihat riwayat pesanan customer secara spesifik
- **PUT /orders/:id/cancel** - melakukan pembatalan pemesanan customer

### 4. Users
- **GET /users** - melihat seluruh user yang ada (hanya admin)
- **GET /users/me** - melihat profile user yang sedang login
- **DELETE /users/id** - menghapus users (hanya admin)

### 5. Validasi & Error Handling
- Validasi data input (produk, pesanan, login)
- Middleware error handler untuk menangani kesalahan umum

## Testing & Dokumentasi Tambahan
contoh beberapa testing menggunakan postman

![image](https://github.com/user-attachments/assets/23632724-0e9c-42fc-9582-6f6b542a38ae)
![image](https://github.com/user-attachments/assets/a5f9753b-873a-4128-8c00-313ceb966f96)


---

> © Rafi Satria Dwi Awanda – Test Order Management API – 2025
