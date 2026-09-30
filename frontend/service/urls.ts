
export default {
  // restaurants
  getRestaurants() { return `/restaurant/index` },
  getOneRestaurant(restaurant_id: number) { return `/restaurant/view?id=${restaurant_id}` },
  getCategories() { return `/restaurant-category/index` },


};
