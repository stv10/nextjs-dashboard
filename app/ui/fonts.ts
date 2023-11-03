import { Montserrat, JetBrains_Mono, Lusitana } from "next/font/google";

export const montserrat = Montserrat({ subsets: ["latin"] });

export const mono = JetBrains_Mono({ subsets: ["latin"] });

export const lusitana = Lusitana({
  subsets: ["latin"],
  weight: ["400", "700"],
});
