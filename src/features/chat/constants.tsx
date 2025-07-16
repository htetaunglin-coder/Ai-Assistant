import {
  Box,
  CircleDollarSign,
  CreditCard,
  FileSpreadsheet,
  FileText,
  HandCoins,
  Scale,
  TrendingUp,
} from "lucide-react";

export type SuggestionItem = {
  id: string;
  icon: React.ReactNode;
  text: string;
};

export const SUGGESTION_ITEMS: SuggestionItem[] = [
  {
    id: "balance-sheet",
    icon: <FileSpreadsheet className="text-blue-600 dark:text-blue-400" />,
    text: "Balance Sheet",
  },
  {
    id: "income-statement",
    icon: <TrendingUp className="text-green-600 dark:text-green-400" />,
    text: "Income Statement",
  },
  {
    id: "cash-flow",
    icon: <CircleDollarSign className="text-purple-600 dark:text-purple-400" />,
    text: "Cash Flow",
  },
  {
    id: "equity-changes",
    icon: <Scale className="text-yellow-600 dark:text-yellow-400" />,
    text: "Equity Changes",
  },
  {
    id: "sales-report",
    icon: <FileText className="text-blue-600 dark:text-blue-400" />,
    text: "Sales Report",
  },
  {
    id: "inventory",
    icon: <Box className="text-yellow-600 dark:text-yellow-400" />,
    text: "Inventory",
  },

  {
    id: "receivables",
    icon: <HandCoins className="text-green-600 dark:text-green-400" />,
    text: "Receivables",
  },
  {
    id: "payables",
    icon: <CreditCard className="text-red-600 dark:text-red-400" />,
    text: "Payables",
  },
];
