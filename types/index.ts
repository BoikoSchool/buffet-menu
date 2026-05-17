// Типи для API відповідей та форм

export interface CategoryWithDishes {
  id: string;
  name: string;
  order: number;
  dishes: DishPublic[];
  createdAt: string;
  updatedAt: string;
}

export interface DishPublic {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  isTopPosition: boolean;
  isActive: boolean;
  order: number;
  topOrder: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisplayData {
  categories: {
    id: string;
    name: string;
    dishes: { id: string; name: string; price: number; photoUrl: string | null }[];
  }[];
  topPositions: { id: string; name: string; price: number; photoUrl: string | null }[];
  settings: {
    categorySlideDuration: number;
    topSlideDuration: number;
    fadeDuration: number;
    itemsPerCategorySlide: number;
  };
}

export interface SettingsData {
  id: string;
  categorySlideDuration: number;
  topSlideDuration: number;
  fadeDuration: number;
  itemsPerCategorySlide: number;
}

export interface ApiError {
  error: string;
}
