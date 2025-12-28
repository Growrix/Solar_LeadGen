import { redirect } from 'next/navigation';

export default function PurchasedLeadsPage() {
  redirect('/installer/leads?tab=purchased');
}