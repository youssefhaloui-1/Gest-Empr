export type Book = {
  id: string;
  title: string;
  author: string;
  field: string;
  stock: number;
  total: number;
  hue: number;
  shelf: string;
  year: number;
  publisher: string;
  isbn: string;
  summary: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  reliability: number;
  history: number;
  late: number;
};

export type Loan = {
  id: string;
  bookId: string;
  memberId: string;
  dueIn: number;
  notified: boolean;
};

export type ReturnRecord = {
  id: string;
  loanId: string;
  bookId: string;
  condition: Cond;
  returnedOn: string;
};

export type MemberLoan = {
  id: string;
  bookId: string;
  borrowedOn: string;
  dueOn: string;
  status: "active" | "returned";
};

export type Reservation = {
  bookId: string;
  createdOn: string;
  status: "active" | "ready" | "cancelled";
};

export type Radar = "ok" | "yellow" | "orange" | "red";
export type Cond = "Neuf" | "Usure normale" | "Endommagé";

export const radar = (d: number): Radar =>
  d <= -4 ? "red" : d < 0 ? "orange" : d <= 3 ? "yellow" : "ok";

export const RADAR = {
  ok: {
    label: "Dans les temps",
    c: "#34D399",
    cls: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
  },
  yellow: {
    label: "Échéance proche",
    c: "#FBBF24",
    cls: "text-amber-200 bg-amber-300/10 border-amber-300/30",
  },
  orange: {
    label: "Retard léger",
    c: "#FF7A59",
    cls: "text-orange-300 bg-orange-400/10 border-orange-400/40",
  },
  red: {
    label: "Retard critique",
    c: "#FF2D55",
    cls: "text-rose-300 bg-rose-500/15 border-rose-500/50",
  },
} as const;

export const dueText = (d: number) =>
  d > 0 ? `dans ${d} j` : d === 0 ? "aujourd'hui" : `${-d} j de retard`;