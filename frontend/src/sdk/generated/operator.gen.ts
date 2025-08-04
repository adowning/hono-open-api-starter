export type Operator = {
  id: string;
  name: string;
  operatorSecret: string;
  operatorAccess: string;
  callbackUrl: string;
  isActive: boolean;
  allowedIps: string[];
  description: string | null;
  productIds: string | null;
  balance: number;
  netRevenue: number;
  acceptedPayments: string[];
  ownerId: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
