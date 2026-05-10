const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==================== Global Categories ====================

export const fetchAllGlobalCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/global`);
    if (!response.ok) throw new Error('Failed to fetch global categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching global categories:', error);
    throw error;
  }
};

export const createGlobalCategory = async (categoryName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/global`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_name: categoryName }),
    });
    if (!response.ok) throw new Error('Failed to create global category');
    return await response.json();
  } catch (error) {
    console.error('Error creating global category:', error);
    throw error;
  }
};

export const deleteGlobalCategory = async (id: string | number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/global/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete global category');
    return await response.json();
  } catch (error) {
    console.error('Error deleting global category:', error);
    throw error;
  }
};

// ==================== Local Categories ====================

export const fetchAllLocalCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/local`);
    if (!response.ok) throw new Error('Failed to fetch local categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching local categories:', error);
    throw error;
  }
};

export const fetchLocalCategoriesByShop = async (shopId: string | number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/local/shop/${shopId}`);
    if (!response.ok) throw new Error('Failed to fetch shop categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching shop categories:', error);
    throw error;
  }
};

export const createLocalCategory = async (categoryData: {
  shop_id: number;
  global_cat_id: number;
  category_name: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Failed to create local category');
    return await response.json();
  } catch (error) {
    console.error('Error creating local category:', error);
    throw error;
  }
};

export const deleteLocalCategory = async (id: string | number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/local/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete local category');
    return await response.json();
  } catch (error) {
    console.error('Error deleting local category:', error);
    throw error;
  }
};
