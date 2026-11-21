export interface Product {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  category_id: string | null;
  supplier_id: string | null;
  template_id: string | null;
  base_quantity: number;
  base_cost_price: number | null;
  base_selling_price: number | null;
  custom_fields: Record<string, any>;
  alert_threshold: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}


export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}
