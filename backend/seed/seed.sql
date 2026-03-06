-- seed.sql
-- Insert sample categories, restaurants & sample admin placeholder (password hashed via create-admin script)
INSERT INTO categories(name,description) VALUES ('Burrito','Burritos'),('Fries','Fries'),('Pizza','Pizza');

INSERT INTO restaurants(name,address,phone,opening_hours,rating,image) VALUES
('Broadway Pizza','Clifton','03381234567','11:00-23:00',4.9,'Images/Restaurants_Images/broadway.webp'),
('Kababjees Fried Chicken','BathIsland','03362509438','11:00-23:00',4.5,'Images/Restaurants_Images/Kababjees-Fried-Chicken.jpg');

-- food items — you can add more rows in a manual seed step using real category ids
INSERT INTO food_items (
  item_id,
  restaurant_id,
  name,
  description,
  price,
  category_id,
  availability,
  image,
  created_at
)
VALUES (
  '8f6f3f8c-3c7f-4a1f-8e4b-2b6c9c3c5f21'
  'eb364df4-5473-4c28-b9d5-a4f045b4474b',
  'fagita',
  'chicken fagita with cheese and jalapeno sauce',
  1150.00,
  '2b3a0f5e-9c16-4c9a-a3c3-2f4e9b7c1234',
  TRUE,
  'https://drbake.pk/wp-content/uploads/2023/06/Dancing-Fajita-Broadway-Pizza.png',
  '2025-12-06 00:00:00'
);