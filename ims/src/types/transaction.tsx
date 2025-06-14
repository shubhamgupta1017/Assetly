export interface TransactionRow {
  _id: string;
  issuerName: string;
  quantity: number;
  status: 'Issued'| 'Approved' | 'Assigned to Project'  | 'Requested'  | 'Rejected'  | 'Overdue'  | 'Returned';
  returnDate: string;
  reason: string;
}

