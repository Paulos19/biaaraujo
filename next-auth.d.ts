// next-auth.d.ts

import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * O objeto Session retornado por `useSession`, `getSession` e recebido como prop
   * para o `SessionProvider`.
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"]; // Mantém as propriedades padrão como name, email, image
  }

  /**
   * O objeto User que passamos para o token JWT.
   */
  interface User extends DefaultUser {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  /** Retornado pela callback `jwt` e recebido pela callback `session` */
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
  }
}