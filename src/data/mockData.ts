import { Book, Member, Loan, MemberLoan, Reservation } from "../types/library";

export const BOOKS: Book[] = [
  { id: "LIV-1001", title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest", field: "Informatique", stock: 3, total: 5, hue: 215, shelf: "INF-004", year: 2022, publisher: "MIT Press", isbn: "978-0262046305", summary: "Une référence complète pour comprendre les algorithmes, les structures de données et leur analyse." },
  { id: "LIV-1002", title: "Physique quantique", author: "Cohen-Tannoudji", field: "Physique", stock: 0, total: 3, hue: 275, shelf: "PHY-012", year: 2018, publisher: "EDP Sciences", isbn: "978-2759810804", summary: "Les fondements et applications de la mécanique quantique présentés avec rigueur et pédagogie." },
  { id: "LIV-1003", title: "Droit constitutionnel", author: "Dominique Rousseau", field: "Droit", stock: 2, total: 4, hue: 25, shelf: "DRT-021", year: 2023, publisher: "LGDJ", isbn: "978-2275144298", summary: "Un panorama actualisé des institutions et des principes du droit constitutionnel français." },
  { id: "LIV-1004", title: "Biologie moléculaire de la cellule", author: "Bruce Alberts", field: "Biologie", stock: 1, total: 2, hue: 150, shelf: "BIO-007", year: 2021, publisher: "De Boeck Supérieur", isbn: "978-2807331939", summary: "Le manuel de référence pour explorer les mécanismes moléculaires au cœur du vivant." },
  { id: "LIV-1005", title: "Macroéconomie", author: "Olivier Blanchard", field: "Économie", stock: 0, total: 3, hue: 45, shelf: "ECO-015", year: 2020, publisher: "Pearson", isbn: "978-2326002599", summary: "Une introduction claire aux grands modèles et enjeux de la macroéconomie contemporaine." },
  { id: "LIV-1006", title: "Algèbre linéaire appliquée", author: "Gilbert Strang", field: "Mathématiques", stock: 4, total: 4, hue: 190, shelf: "MAT-002", year: 2019, publisher: "Wellesley-Cambridge Press", isbn: "978-0980232776", summary: "Matrices, espaces vectoriels et applications concrètes expliqués par un pédagogue reconnu." },
  { id: "LIV-1007", title: "Histoire de la pensée politique", author: "Jean-Jacques Chevallier", field: "Sciences politiques", stock: 2, total: 2, hue: 340, shelf: "POL-009", year: 2018, publisher: "Payot", isbn: "978-2228904210", summary: "Une traversée des grandes doctrines politiques, de l'Antiquité aux débats modernes." },
  { id: "LIV-1008", title: "Chimie organique", author: "Paula Bruice", field: "Chimie", stock: 1, total: 3, hue: 120, shelf: "CHI-018", year: 2021, publisher: "Pearson", isbn: "978-1292160344", summary: "Les réactions et concepts essentiels de la chimie organique avec de nombreux exemples." },
  { id: "LIV-1009", title: "Réseaux de neurones", author: "François Chollet", field: "Intelligence artificielle", stock: 2, total: 4, hue: 235, shelf: "INF-018", year: 2022, publisher: "Manning", isbn: "978-1617296864", summary: "Construire des systèmes d'apprentissage profond en combinant théorie et pratique." },
  { id: "LIV-1010", title: "Bases de données", author: "Ramez Elmasri", field: "Informatique", stock: 3, total: 5, hue: 205, shelf: "INF-022", year: 2020, publisher: "Pearson", isbn: "978-0133970777", summary: "Conception, modélisation et interrogation des bases de données relationnelles." },
  { id: "LIV-1011", title: "Le monde de Sophie", author: "Jostein Gaarder", field: "Philosophie", stock: 5, total: 6, hue: 305, shelf: "PHI-003", year: 2017, publisher: "Le Livre de Poche", isbn: "978-2253009485", summary: "Un roman initiatique qui invite à découvrir l'histoire de la philosophie." },
  { id: "LIV-1012", title: "Les villes invisibles", author: "Italo Calvino", field: "Littérature", stock: 2, total: 3, hue: 330, shelf: "LIT-014", year: 2016, publisher: "Gallimard", isbn: "978-2070360423", summary: "Un voyage poétique à travers des cités imaginaires et les rêves de leurs habitants." },
  { id: "LIV-1013", title: "Méthodes de recherche", author: "Raymond Quivy", field: "Méthodologie", stock: 4, total: 4, hue: 175, shelf: "MET-006", year: 2021, publisher: "Dunod", isbn: "978-2100811830", summary: "Les étapes pratiques pour construire une problématique et mener un travail universitaire." },
  { id: "LIV-1014", title: "Gestion financière", author: "Pierre Vernimmen", field: "Gestion", stock: 1, total: 3, hue: 70, shelf: "GES-011", year: 2023, publisher: "Dalloz", isbn: "978-2247226552", summary: "Les outils indispensables pour analyser les décisions financières d'une organisation." },
  { id: "LIV-1015", title: "Génie logiciel", author: "Ian Sommerville", field: "Informatique", stock: 3, total: 4, hue: 260, shelf: "INF-030", year: 2019, publisher: "Pearson", isbn: "978-0133943030", summary: "Processus, architecture, qualité et maintenance des logiciels modernes." },
  { id: "LIV-1016", title: "Écologie scientifique", author: "Robert Barbault", field: "Environnement", stock: 2, total: 3, hue: 105, shelf: "ENV-004", year: 2018, publisher: "Dunod", isbn: "978-2100779993", summary: "Comprendre les interactions entre organismes, écosystèmes et changements globaux." },
  { id: "LIV-1017", title: "Anatomie humaine", author: "Elaine Marieb", field: "Médecine", stock: 1, total: 2, hue: 5, shelf: "MED-019", year: 2020, publisher: "Pearson", isbn: "978-1292263960", summary: "Une introduction visuelle et progressive aux structures du corps humain." },
  { id: "LIV-1018", title: "Communication scientifique", author: "Jean-Marc Lévy-Leboyer", field: "Communication", stock: 4, total: 5, hue: 290, shelf: "COM-008", year: 2022, publisher: "Hachette", isbn: "978-2017140127", summary: "Présenter des résultats clairs, convaincants et adaptés à chaque public." },
];

export const MEMBERS: Member[] = [
  { id: "ETU-24017", name: "Salma El Idrissi", email: "s.elidrissi@usmba.ac.ma", role: "Étudiante · Master Informatique", phone: "+212 6 61 22 40 17", reliability: 96, history: 31, late: 0 },
  { id: "ETU-23102", name: "Yassine Benali", email: "y.benali@usmba.ac.ma", role: "Étudiant · Licence Droit", phone: "+212 6 62 18 55 02", reliability: 78, history: 14, late: 2 },
  { id: "ENS-0456", name: "Pr. Karim Alaoui", email: "k.alaoui@usmba.ac.ma", role: "Enseignant · Physique", phone: "+212 5 35 60 11 45", reliability: 88, history: 52, late: 3 },
  { id: "ETU-22340", name: "Imane Chraibi", email: "i.chraibi@usmba.ac.ma", role: "Étudiante · Doctorat Biologie", phone: "+212 6 70 09 33 40", reliability: 41, history: 22, late: 9 },
  { id: "ETU-24211", name: "Omar Tazi", email: "o.tazi@usmba.ac.ma", role: "Étudiant · Licence Économie", phone: "+212 6 55 71 20 11", reliability: 92, history: 9, late: 0 },
];

export const INITIAL_LOANS: Loan[] = [
  { id: "EMP-501", bookId: "LIV-1002", memberId: "ENS-0456", dueIn: 2, notified: false },
  { id: "EMP-502", bookId: "LIV-1005", memberId: "ETU-23102", dueIn: -2, notified: false },
  { id: "EMP-503", bookId: "LIV-1004", memberId: "ETU-22340", dueIn: -11, notified: false },
  { id: "EMP-504", bookId: "LIV-1001", memberId: "ETU-24017", dueIn: 9, notified: false },
  { id: "EMP-505", bookId: "LIV-1003", memberId: "ETU-24211", dueIn: 1, notified: false },
  { id: "EMP-506", bookId: "LIV-1008", memberId: "ETU-22340", dueIn: -5, notified: true },
];

export const MEMBER_LOANS: MemberLoan[] = [
  { id: "MON-101", bookId: "LIV-1001", borrowedOn: "2026-10-02", dueOn: "2026-10-23", status: "active" },
  { id: "MON-102", bookId: "LIV-1006", borrowedOn: "2026-09-18", dueOn: "2026-10-09", status: "returned" },
  { id: "MON-103", bookId: "LIV-1013", borrowedOn: "2026-08-21", dueOn: "2026-09-11", status: "returned" },
];

export const MEMBER_RESERVATIONS: Reservation[] = [
  { bookId: "LIV-1005", createdOn: "2026-10-11", status: "ready" },
  { bookId: "LIV-1004", createdOn: "2026-10-08", status: "active" },
];

export const DOMAINS = ["usmba.ac.ma", "univ-fes.ac.ma", "um5.ac.ma", "edu.univ.ma"];